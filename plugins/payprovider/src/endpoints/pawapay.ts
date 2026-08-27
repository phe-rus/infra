import {
    createAuthEndpoint,
    sessionMiddleware,
    sensitiveSessionMiddleware,
    getAuthoritativeSessionFromCtx,
    APIError,
} from "better-auth/api"
import { signJWT } from "better-auth/plugins"
import { getOAuthProviderApi } from "@better-auth/oauth-provider"
import * as z from "zod"
import { PawaPayClient } from "../pawapay/pawapay-client"
import type { PawaPayEnvironment } from "../pawapay/pawapay-client"
import { verifyPawaPayCallback } from "../pawapay/verify-signature"
import { toPaymentCountryOptions } from "../pawapay/active-config"
import type { PaymentCountryOption } from "../pawapay/active-config"
import { convertViaUsd, fetchUsdRates } from "../pawapay/fx"
import type { FxRates } from "../pawapay/fx"
import { WALLET_NUMBER_PENDING_TTL_MS } from "../pawapay/constants"
import type { PaymentIntentStatus, PaymentStatus } from "../pawapay/constants"

const ACTIVE_CONFIG_CACHE_KEY = "payment:active-conf:v1"
const ACTIVE_CONFIG_CACHE_TTL = 60 * 60 // 1 hour — PawaPay's own provider list changes rarely

const FX_CACHE_KEY = "payment:fx-rates:v1"
const FX_CACHE_TTL = 60 * 60 * 12 // 12 hours — the upstream rate table itself only updates once a day

export type PaymentReceiptInfo = {
    userName: string
    email: string
    type: "deposit" | "payout" | "refund"
    amount: string
    currency: string
    provider: string | null
    phoneNumber: string | null
    referenceId: string
    date: string
}

export type OAuthAccess = {
    userId: string
    clientId: string | null
    scopes: string[]
}

// Resolves a bearer token against whichever oauth-provider plugin is
// registered on this better-auth instance. Deliberately does not go through
// /oauth2/userinfo — that endpoint requires the "openid" scope, and a
// connected app that only requested "payments" would be rejected even
// though it holds the scope this plugin actually checks.
export async function resolveOAuthAccess(
    ctx: Parameters<typeof signJWT>[0],
    headers: Headers | null | undefined
): Promise<OAuthAccess | null> {
    const authorization = headers?.get("authorization")
    if (!authorization?.startsWith("Bearer ")) return null
    // getPlugin's return type depends on the concrete app's Options, which
    // this portable plugin can't know statically — cast only .options to
    // the shape getOAuthProviderApi actually requires.
    const provider = ctx.context.getPlugin("oauth-provider") as {
        options: Parameters<typeof getOAuthProviderApi>[1]
    } | null
    if (!provider) return null
    const token = authorization.slice("Bearer ".length)
    // requireActiveAccessToken returns Awaitable<T> (Promise<T> | T), and T
    // carries an index signature (jose's JWTPayload) — chaining .catch()
    // directly on that union resolves through the index signature to
    // `unknown` instead of a real Promise method, so use try/catch instead.
    let payload: Awaited<
        ReturnType<
            ReturnType<typeof getOAuthProviderApi>["requireActiveAccessToken"]
        >
    >
    try {
        payload = await getOAuthProviderApi(
            ctx,
            provider.options
        ).requireActiveAccessToken(token)
    } catch {
        return null
    }
    if (typeof payload.sub !== "string") return null
    return {
        userId: payload.sub,
        clientId:
            typeof payload.client_id === "string" ? payload.client_id : null,
        scopes:
            typeof payload.scope === "string" ? payload.scope.split(" ") : [],
    }
}

export type PawaPayEndpointsDeps = {
    client: PawaPayClient
    cache: KVNamespace
    isAdmin: (role: string) => boolean
    /** Builds the receipt email's subject/html. */
    buildReceipt?: (receipt: PaymentReceiptInfo) => {
        subject: string
        html: string
    }
    /** Actually sends the receipt built by buildReceipt. */
    send?: (data: { to: string; subject: string; html: string }) => Promise<void>
}

export type { PawaPayEnvironment }

export function createPawaPayEndpoints(deps: PawaPayEndpointsDeps) {
    const { client, cache, isAdmin, buildReceipt, send } = deps

    // shared by both the session-gated /pay/config (used by the deposit/
    // payout forms) and the public /pay/countries.jsonc endpoint below —
    // same cache entry, populated lazily by whichever request hits it
    // first after the previous entry expired
    async function getCachedCountries(): Promise<PaymentCountryOption[]> {
        const cached = await cache.get(ACTIVE_CONFIG_CACHE_KEY)
        if (cached) return JSON.parse(cached) as PaymentCountryOption[]

        const raw = await client.getActiveConfig()
        const countries = toPaymentCountryOptions(raw)
        await cache.put(ACTIVE_CONFIG_CACHE_KEY, JSON.stringify(countries), {
            expirationTtl: ACTIVE_CONFIG_CACHE_TTL,
        })
        return countries
    }

    // shared by depositPayment (a direct, first-party-or-Bearer deposit) and
    // confirmPaymentIntent (a deposit tied to a redirect-flow intent): both
    // end up doing the exact same PawaPay call + payment row bookkeeping,
    // only who's paying and why differs
    async function performDeposit(
        ctx: Parameters<typeof signJWT>[0],
        params: {
            userId: string
            clientId: string | null
            amount: string
            currency: string
            phoneNumber: string
            provider: string
            purpose?: string
        }
    ) {
        const depositId = crypto.randomUUID()
        const result = await client.initiateDeposit({
            depositId,
            payer: {
                type: "MMO",
                accountDetails: {
                    phoneNumber: params.phoneNumber,
                    provider: params.provider,
                },
            },
            amount: params.amount,
            currency: params.currency,
            clientReferenceId: depositId,
            ...(params.purpose && { customerMessage: params.purpose }),
        })

        const status: PaymentStatus =
            result.status === "ACCEPTED" ? "pending" : "failed"

        const payment = await ctx.context.adapter.create<{
            id: string
        }>({
            model: "payment",
            data: {
                userId: params.userId,
                clientId: params.clientId,
                type: "deposit",
                provider: params.provider,
                phoneNumber: params.phoneNumber,
                amount: params.amount,
                currency: params.currency,
                pawapayReferenceId: depositId,
                status,
                failureReason: result.failureReason
                    ? JSON.stringify(result.failureReason)
                    : undefined,
            },
        })

        return {
            paymentId: payment.id,
            depositId,
            status,
            failureReason: result.failureReason,
        }
    }

    // only a connected OAuth app can create a payment intent. This is
    // exclusively the redirect-checkout path, never a first-party dashboard
    // action, so unlike depositPayment there's no session fallback here
    async function resolveClientAccess(
        ctx: Parameters<typeof signJWT>[0]
    ): Promise<{ userId: string; clientId: string }> {
        const access = await resolveOAuthAccess(ctx, ctx.headers)
        if (!access) {
            throw new APIError("UNAUTHORIZED", {
                message: "Authentication required",
            })
        }
        if (!access.scopes.includes("payments")) {
            throw new APIError("FORBIDDEN", {
                message: "This application was not granted the payments scope",
            })
        }
        if (!access.clientId) {
            throw new APIError("BAD_REQUEST", {
                message: "No client context on this token",
            })
        }
        return { userId: access.userId, clientId: access.clientId }
    }

    // shared by paymentWebhook (real webhook delivery) and getPaymentIntent
    // (active reconciliation — PawaPay's sandbox webhook can't reach a
    // local dev instance, so the confirm page's own poll doubles as the
    // thing that discovers a terminal outcome). Every side effect a
    // completed/failed deposit triggers lives here once, not duplicated
    // per caller: the payment row itself, the linked intent (if this
    // deposit fulfilled one), the wallet-number verification, and the
    // receipt email
    async function applyPaymentOutcome(
        ctx: Parameters<typeof signJWT>[0],
        existing: {
            id: string
            userId: string
            type: string
            provider: string | null
            phoneNumber: string | null
            amount: string
            currency: string
            pawapayReferenceId: string | null
            status: string
        },
        status: PaymentStatus,
        failureReason?: unknown
    ) {
        if (status === existing.status) return

        await ctx.context.adapter.update({
            model: "payment",
            where: [{ field: "id", value: existing.id }],
            update: {
                status,
                ...(failureReason
                    ? { failureReason: JSON.stringify(failureReason) }
                    : {}),
            },
        })

        if (status === "completed" || status === "failed") {
            await ctx.context.adapter.updateMany({
                model: "paymentIntent",
                where: [{ field: "paymentId", value: existing.id }],
                update: {
                    status,
                    ...(failureReason
                        ? { failureReason: JSON.stringify(failureReason) }
                        : {}),
                },
            })
        }

        // a saved number graduates from "pending" to "verified" the
        // first time a deposit through it actually clears
        if (status === "completed" && existing.type === "deposit") {
            const matchingWallet =
                existing.phoneNumber && existing.provider
                    ? await ctx.context.adapter.findOne<{
                          id: string
                          status: string
                      }>({
                          model: "walletNumber",
                          where: [
                              { field: "userId", value: existing.userId },
                              {
                                  field: "phoneNumber",
                                  value: existing.phoneNumber,
                              },
                              { field: "provider", value: existing.provider },
                          ],
                      })
                    : null

            if (matchingWallet && matchingWallet.status !== "verified") {
                await ctx.context.adapter.update({
                    model: "walletNumber",
                    where: [{ field: "id", value: matchingWallet.id }],
                    update: { status: "verified" },
                })

                const hasPrimary = await ctx.context.adapter.findOne({
                    model: "walletNumber",
                    where: [
                        { field: "userId", value: existing.userId },
                        { field: "isPrimary", value: true },
                    ],
                })
                if (!hasPrimary) {
                    await ctx.context.adapter.update({
                        model: "walletNumber",
                        where: [{ field: "id", value: matchingWallet.id }],
                        update: { isPrimary: true },
                    })
                }
            }
        }

        if (status === "completed" && buildReceipt && send) {
            const user = await ctx.context.internalAdapter.findUserById(
                existing.userId
            )
            if (user) {
                const { subject, html } = buildReceipt({
                    userName: user.name,
                    email: user.email,
                    type: existing.type as "deposit" | "payout" | "refund",
                    amount: existing.amount,
                    currency: existing.currency,
                    provider: existing.provider,
                    phoneNumber: existing.phoneNumber,
                    referenceId: existing.pawapayReferenceId ?? "",
                    date: new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }),
                })
                // runInBackgroundOrAwait: this runs from both the real
                // webhook and the reconciliation poll — neither should
                // wait on Resend's round trip, and it already logs
                // failures internally so no manual .catch is needed
                await ctx.context.runInBackgroundOrAwait(
                    send({ to: user.email, subject, html })
                )
            }
        }
    }

    return {
        // any signed-in user — the deposit/payout forms need this to
        // populate a country/provider picker, not just admins
        paymentConfig: createAuthEndpoint(
            "/pay/config",
            { method: "GET", use: [sessionMiddleware] },
            async (ctx) => {
                return ctx.json({
                    countries: await getCachedCountries(),
                })
            }
        ),
        // admin/owner only — this is the platform's real money sitting
        // at PawaPay, not something a plain user should see. The
        // balances themselves are never cached (they change with every
        // transaction); only the USD FX rate table used to combine
        // them into one total is
        walletBalances: createAuthEndpoint(
            "/pay/balances",
            {
                method: "GET",
                use: [sessionMiddleware],
                query: z.object({
                    currency: z.string().length(3).optional(),
                }),
            },
            async (ctx) => {
                if (!isAdmin(ctx.context.session.user.role ?? "")) {
                    throw new APIError("FORBIDDEN", {
                        message: "Admin access required",
                    })
                }
                const { balances } = await client.getWalletBalances()

                if (!ctx.query.currency) {
                    return ctx.json({ balances, total: null })
                }

                const cachedRates = await cache.get(FX_CACHE_KEY)
                const usdRates: FxRates = cachedRates
                    ? JSON.parse(cachedRates)
                    : await fetchUsdRates().then(async (rates) => {
                          await cache.put(FX_CACHE_KEY, JSON.stringify(rates), {
                              expirationTtl: FX_CACHE_TTL,
                          })
                          return rates
                      })

                const targetCurrency = ctx.query.currency.toUpperCase()
                let amount = 0
                const unconvertedCurrencies: string[] = []
                for (const balance of balances) {
                    const converted = convertViaUsd(
                        Number(balance.balance),
                        balance.currency,
                        targetCurrency,
                        usdRates
                    )
                    if (converted === null) {
                        unconvertedCurrencies.push(balance.currency)
                        continue
                    }
                    amount += converted
                }

                return ctx.json({
                    balances,
                    total: {
                        currency: targetCurrency,
                        amount,
                        unconvertedCurrencies,
                    },
                })
            }
        ),
        // self-service: the signed-in user's own payment history. infra's
        // own dashboard reads this straight off ctx.adapter (it runs
        // in-process with the auth server) — this is the same query
        // exposed over HTTP so www, which only ever talks to infra via
        // authClient, can read it too
        myPayments: createAuthEndpoint(
            "/pay/payments/mine",
            { method: "GET", use: [sessionMiddleware] },
            async (ctx) => {
                const payments = await ctx.context.adapter.findMany<{
                    id: string
                    userId: string
                    clientId: string | null
                    type: string
                    rail: string
                    provider: string | null
                    phoneNumber: string | null
                    amount: string
                    currency: string
                    pawapayReferenceId: string | null
                    status: string
                    failureReason: string | null
                    metadata: string | null
                    createdAt: Date
                    updatedAt: Date
                }>({
                    model: "payment",
                    where: [
                        {
                            field: "userId",
                            value: ctx.context.session.user.id,
                        },
                    ],
                    sortBy: {
                        field: "createdAt",
                        direction: "desc",
                    },
                })
                return ctx.json({ payments })
            }
        ),
        // self-service: re-sends the receipt email for one of the
        // caller's own completed payments, reusing the same buildReceipt
        // callback the webhook fires on first completion — just triggered
        // on demand instead of by a status transition
        resendReceipt: createAuthEndpoint(
            "/pay/receipt/resend",
            {
                method: "POST",
                use: [sessionMiddleware],
                body: z.object({ paymentId: z.string().min(1) }),
            },
            async (ctx) => {
                if (!buildReceipt || !send) {
                    throw new APIError("BAD_REQUEST", {
                        message:
                            "Receipt emails are not configured on this instance",
                    })
                }

                const payment = await ctx.context.adapter.findOne<{
                    id: string
                    userId: string
                    type: string
                    provider: string | null
                    phoneNumber: string | null
                    amount: string
                    currency: string
                    pawapayReferenceId: string
                    status: string
                    createdAt: Date
                }>({
                    model: "payment",
                    where: [{ field: "id", value: ctx.body.paymentId }],
                })
                if (!payment || payment.userId !== ctx.context.session.user.id) {
                    throw new APIError("NOT_FOUND", {
                        message: "Payment not found",
                    })
                }
                if (payment.status !== "completed") {
                    throw new APIError("BAD_REQUEST", {
                        message: "Only completed payments have a receipt",
                    })
                }

                // a user-clicked "resend" needs a real success/failure
                // answer (the UI shows an error toast on rejection), so
                // this one stays a plain await rather than
                // runInBackgroundOrAwait — just caught and rethrown as a
                // clean APIError instead of an opaque unhandled rejection
                try {
                    const { subject, html } = buildReceipt({
                        userName: ctx.context.session.user.name,
                        email: ctx.context.session.user.email,
                        type: payment.type as "deposit" | "payout" | "refund",
                        amount: payment.amount,
                        currency: payment.currency,
                        provider: payment.provider,
                        phoneNumber: payment.phoneNumber,
                        referenceId: payment.pawapayReferenceId,
                        date: new Date(payment.createdAt).toLocaleDateString(
                            "en-US",
                            {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            }
                        ),
                    })
                    await send({
                        to: ctx.context.session.user.email,
                        subject,
                        html,
                    })
                } catch (error) {
                    ctx.context.logger.error(
                        "Failed to resend payment receipt email",
                        error
                    )
                    throw new APIError("INTERNAL_SERVER_ERROR", {
                        message: "Could not send this receipt",
                    })
                }

                return ctx.json({ sent: true })
            }
        ),
        // self-service: the signed-in user's own saved mobile-money
        // numbers — separate from a payment's own phoneNumber, this is
        // what backs the wallet cards and lets the deposit form skip
        // retyping a number every time. A number starts "pending" and
        // only becomes "verified" once a real deposit clears through it
        // (see verifyWalletNumber, called from the webhook below) — a
        // pending one older than 24h is swept here before the list
        // is even read, since it never proved it's real
        listWalletNumbers: createAuthEndpoint(
            "/pay/wallets",
            { method: "GET", use: [sessionMiddleware] },
            async (ctx) => {
                const userId = ctx.context.session.user.id

                await ctx.context.adapter.deleteMany({
                    model: "walletNumber",
                    where: [
                        { field: "userId", value: userId },
                        { field: "status", value: "pending" },
                        {
                            field: "createdAt",
                            operator: "lt",
                            value: new Date(
                                Date.now() - WALLET_NUMBER_PENDING_TTL_MS
                            ),
                        },
                    ],
                })

                const wallets = await ctx.context.adapter.findMany<{
                    id: string
                    userId: string
                    phoneNumber: string
                    provider: string
                    label: string | null
                    status: string
                    isPrimary: boolean
                    createdAt: Date
                    updatedAt: Date
                }>({
                    model: "walletNumber",
                    where: [{ field: "userId", value: userId }],
                    sortBy: {
                        field: "createdAt",
                        direction: "desc",
                    },
                })
                // primary pinned to the top, most recently added first otherwise
                wallets.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
                return ctx.json({ wallets })
            }
        ),
        // always starts pending and never primary — a freshly added
        // number hasn't proven it's real yet, see listWalletNumbers above
        addWalletNumber: createAuthEndpoint(
            "/pay/wallets/add",
            {
                method: "POST",
                use: [sessionMiddleware],
                body: z.object({
                    phoneNumber: z.string().min(1),
                    provider: z.string().min(1),
                    label: z.string().min(1).max(40).optional(),
                }),
            },
            async (ctx) => {
                const wallet = await ctx.context.adapter.create({
                    model: "walletNumber",
                    data: {
                        userId: ctx.context.session.user.id,
                        phoneNumber: ctx.body.phoneNumber,
                        provider: ctx.body.provider,
                        label: ctx.body.label,
                        status: "pending",
                        isPrimary: false,
                    },
                })

                return ctx.json({ wallet })
            }
        ),
        removeWalletNumber: createAuthEndpoint(
            "/pay/wallets/remove",
            {
                method: "POST",
                use: [sessionMiddleware],
                body: z.object({ walletId: z.string().min(1) }),
            },
            async (ctx) => {
                const userId = ctx.context.session.user.id
                const wallet = await ctx.context.adapter.findOne<{
                    id: string
                    userId: string
                    isPrimary: boolean
                }>({
                    model: "walletNumber",
                    where: [{ field: "id", value: ctx.body.walletId }],
                })
                if (!wallet || wallet.userId !== userId) {
                    throw new APIError("NOT_FOUND", {
                        message: "Saved number not found",
                    })
                }

                await ctx.context.adapter.delete({
                    model: "walletNumber",
                    where: [{ field: "id", value: wallet.id }],
                })

                // removing the primary number promotes the most recently
                // verified remaining one (a still-pending number can't
                // become primary), so a usable number never loses its
                // primary status outright
                if (wallet.isPrimary) {
                    const remaining = await ctx.context.adapter.findMany<{
                        id: string
                    }>({
                        model: "walletNumber",
                        where: [
                            { field: "userId", value: userId },
                            {
                                field: "status",
                                value: "verified",
                            },
                        ],
                        sortBy: {
                            field: "createdAt",
                            direction: "desc",
                        },
                        limit: 1,
                    })
                    if (remaining[0]) {
                        await ctx.context.adapter.update({
                            model: "walletNumber",
                            where: [
                                {
                                    field: "id",
                                    value: remaining[0].id,
                                },
                            ],
                            update: { isPrimary: true },
                        })
                    }
                }

                return ctx.json({ removed: true })
            }
        ),
        setPrimaryWalletNumber: createAuthEndpoint(
            "/pay/wallets/primary",
            {
                method: "POST",
                use: [sessionMiddleware],
                body: z.object({ walletId: z.string().min(1) }),
            },
            async (ctx) => {
                const userId = ctx.context.session.user.id
                const wallet = await ctx.context.adapter.findOne<{
                    id: string
                    userId: string
                    status: string
                }>({
                    model: "walletNumber",
                    where: [{ field: "id", value: ctx.body.walletId }],
                })
                if (!wallet || wallet.userId !== userId) {
                    throw new APIError("NOT_FOUND", {
                        message: "Saved number not found",
                    })
                }
                if (wallet.status !== "verified") {
                    throw new APIError("BAD_REQUEST", {
                        message: "Only a verified number can be set as primary",
                    })
                }

                await ctx.context.adapter.updateMany({
                    model: "walletNumber",
                    where: [
                        { field: "userId", value: userId },
                        { field: "isPrimary", value: true },
                    ],
                    update: { isPrimary: false },
                })
                await ctx.context.adapter.update({
                    model: "walletNumber",
                    where: [{ field: "id", value: wallet.id }],
                    update: { isPrimary: true },
                })

                return ctx.json({ primary: wallet.id })
            }
        ),
        // self-service: the signed-in user is the payer. A first-party
        // session (dashboard, www's shared-cookie self-service page)
        // is always allowed, no scope concept applies there, and
        // clientId comes straight from the body (a dashboard-initiated
        // deposit has none). A connected OAuth app instead sends an
        // Authorization: Bearer <access token> with no cookie — it
        // must have been granted the "payments" scope, checked via
        // resolveOAuthAccess (validated against whatever oauth-provider
        // plugin is registered on this instance, not assumed — same
        // reasoning as the injected isAdmin / the notify-plugin lookup
        // elsewhere in this file). clientId in that case comes from the verified token
        // itself, not the caller-supplied body field, so one connected
        // app can't attribute a deposit to another app's clientId.
        depositPayment: createAuthEndpoint(
            "/pay/deposit",
            {
                method: "POST",
                body: z.object({
                    amount: z.string().min(1),
                    currency: z.string().length(3),
                    phoneNumber: z.string().min(1),
                    provider: z.string().min(1),
                    // PawaPay's customerMessage constraint: alphanumeric
                    // + space only, 4-22 chars (confirmed live — a "-"
                    // or anything under 4 chars gets REJECTED)
                    purpose: z
                        .string()
                        .min(4)
                        .max(22)
                        .regex(/^[a-zA-Z0-9 ]*$/)
                        .optional(),
                    clientId: z.string().optional(),
                }),
            },
            async (ctx) => {
                // initiates a real deposit, so a browser session here
                // needs a fresh DB check, not a cached cookie
                const session = await getAuthoritativeSessionFromCtx(ctx)
                let userId: string
                let clientId: string | null
                if (session) {
                    userId = session.user.id
                    clientId = ctx.body.clientId ?? null
                } else {
                    const access = await resolveOAuthAccess(ctx, ctx.headers)
                    if (!access) {
                        throw new APIError("UNAUTHORIZED", {
                            message: "Authentication required",
                        })
                    }
                    if (!access.scopes.includes("payments")) {
                        throw new APIError("FORBIDDEN", {
                            message:
                                "This application was not granted the payments scope",
                        })
                    }
                    userId = access.userId
                    clientId = access.clientId
                }

                // ACCEPTED just means PawaPay took the request for
                // processing — the real outcome (completed/failed)
                // only ever arrives later via the signed webhook
                const { depositId, status } = await performDeposit(ctx, {
                    userId,
                    clientId,
                    amount: ctx.body.amount,
                    currency: ctx.body.currency,
                    phoneNumber: ctx.body.phoneNumber,
                    provider: ctx.body.provider,
                    purpose: ctx.body.purpose,
                })

                return ctx.json({ depositId, status })
            }
        ),
        // connected-app-only (see resolveClientAccess): creates a
        // redirect-checkout intent instead of depositing immediately,
        // the requesting app sends its user's browser to Infraccount's
        // /pay/confirm?intent=<id> next, which is where the actual
        // deposit gets initiated once the payer picks a number
        createPaymentIntent: createAuthEndpoint(
            "/pay/intent/create",
            {
                method: "POST",
                body: z.object({
                    amount: z.string().min(1),
                    currency: z.string().length(3),
                    purpose: z
                        .string()
                        .min(4)
                        .max(22)
                        .regex(/^[a-zA-Z0-9 ]*$/)
                        .optional(),
                    // must exactly match one of the requesting client's own
                    // registered redirect_uris — never trusted as-is
                    returnUrl: z.string().url(),
                }),
            },
            async (ctx) => {
                const { userId, clientId } = await resolveClientAccess(ctx)

                const oauthClient = await ctx.context.adapter.findOne<{
                    clientId: string
                    redirectUris: string[]
                }>({
                    model: "oauthClient",
                    where: [{ field: "clientId", value: clientId }],
                })
                if (!oauthClient?.redirectUris.includes(ctx.body.returnUrl)) {
                    throw new APIError("BAD_REQUEST", {
                        message:
                            "returnUrl is not a registered redirect URI for this client",
                    })
                }

                const intent = await ctx.context.adapter.create<{
                    id: string
                }>({
                    model: "paymentIntent",
                    data: {
                        clientId,
                        userId,
                        amount: ctx.body.amount,
                        currency: ctx.body.currency,
                        purpose: ctx.body.purpose,
                        returnUrl: ctx.body.returnUrl,
                        status: "created",
                    },
                })

                return ctx.json({ intentId: intent.id })
            }
        ),
        // session-gated: Infraccount reads this to render the confirm
        // screen, then polls it after confirming. Once status is
        // terminal, the response also carries a signed JWT (infra's own
        // JWKS) the payer's browser then carries back to the app's
        // returnUrl as proof, so the app never has to trust the redirect
        // itself, only the token in it
        getPaymentIntent: createAuthEndpoint(
            "/pay/intent/get",
            {
                method: "GET",
                use: [sessionMiddleware],
                query: z.object({ id: z.string() }),
            },
            async (ctx) => {
                const intent = await ctx.context.adapter.findOne<{
                    id: string
                    userId: string
                    status: PaymentIntentStatus
                    amount: string
                    currency: string
                    purpose: string | null
                    returnUrl: string
                    failureReason: string | null
                    paymentId: string | null
                }>({
                    model: "paymentIntent",
                    where: [{ field: "id", value: ctx.query.id }],
                })
                if (!intent || intent.userId !== ctx.context.session.user.id) {
                    throw new APIError("NOT_FOUND", {
                        message: "Payment intent not found",
                    })
                }

                // active reconciliation: PawaPay's sandbox/webhook can't
                // reach a local dev instance, so this page's own poll is
                // what actually discovers a terminal outcome there
                if (intent.status === "pending" && intent.paymentId) {
                    const payment = await ctx.context.adapter.findOne<{
                        id: string
                        userId: string
                        type: string
                        provider: string | null
                        phoneNumber: string | null
                        amount: string
                        currency: string
                        pawapayReferenceId: string | null
                        status: string
                    }>({
                        model: "payment",
                        where: [{ field: "id", value: intent.paymentId }],
                    })
                    if (payment && payment.pawapayReferenceId) {
                        const checked = await client.checkDepositStatus(
                            payment.pawapayReferenceId
                        )
                        if (checked.status === "FOUND" && checked.data) {
                            const resolvedStatus: PaymentStatus =
                                checked.data.status === "COMPLETED"
                                    ? "completed"
                                    : checked.data.status === "FAILED"
                                      ? "failed"
                                      : "pending"
                            if (resolvedStatus !== "pending") {
                                await applyPaymentOutcome(
                                    ctx,
                                    payment,
                                    resolvedStatus,
                                    checked.data.failureReason
                                )
                                intent.status = resolvedStatus
                                if (checked.data.failureReason) {
                                    intent.failureReason = JSON.stringify(
                                        checked.data.failureReason
                                    )
                                }
                            }
                        }
                    }
                }

                let token: string | undefined
                if (intent.status === "completed" || intent.status === "failed") {
                    token = await signJWT(ctx, {
                        payload: {
                            intentId: intent.id,
                            status: intent.status,
                            amount: intent.amount,
                            currency: intent.currency,
                            ...(intent.failureReason
                                ? { failureReason: intent.failureReason }
                                : {}),
                        },
                    })
                }

                return ctx.json({
                    intent: {
                        id: intent.id,
                        status: intent.status,
                        amount: intent.amount,
                        currency: intent.currency,
                        purpose: intent.purpose,
                        returnUrl: intent.returnUrl,
                    },
                    token,
                })
            }
        ),
        // session-gated: called from Infraccount's confirm screen once
        // the payer picked/entered a mobile-money number
        // self-service: reconciles one of the caller's own standalone
        // deposits (not tied to a paymentIntent — that case already
        // reconciles itself via getPaymentIntent's own poll) against
        // PawaPay's API directly
        pawaPaySync: createAuthEndpoint(
            "/pay/pawapay-sync",
            {
                method: "POST",
                use: [sessionMiddleware],
                body: z.object({ pawapayReferenceId: z.string().min(1) }),
            },
            async (ctx) => {
                const existing = await ctx.context.adapter.findOne<{
                    id: string
                    userId: string
                    type: string
                    provider: string | null
                    phoneNumber: string | null
                    amount: string
                    currency: string
                    pawapayReferenceId: string | null
                    status: string
                }>({
                    model: "payment",
                    where: [
                        {
                            field: "pawapayReferenceId",
                            value: ctx.body.pawapayReferenceId,
                        },
                        { field: "userId", value: ctx.context.session.user.id },
                    ],
                })
                if (!existing) {
                    throw new APIError("NOT_FOUND", {
                        message: "Payment not found",
                    })
                }

                // deposits and refunds are different resources on
                // PawaPay's side, each with their own status-check call
                const checked =
                    existing.type === "refund"
                        ? await client.checkRefundStatus(
                              ctx.body.pawapayReferenceId
                          )
                        : await client.checkDepositStatus(
                              ctx.body.pawapayReferenceId
                          )
                if (checked.status !== "FOUND" || !checked.data) {
                    return ctx.json({ status: existing.status })
                }

                const status: PaymentStatus =
                    checked.data.status === "COMPLETED"
                        ? "completed"
                        : checked.data.status === "FAILED"
                          ? "failed"
                          : "pending"

                await applyPaymentOutcome(
                    ctx,
                    existing,
                    status,
                    checked.data.failureReason
                )

                return ctx.json({ status })
            }
        ),
        confirmPaymentIntent: createAuthEndpoint(
            "/pay/intent/confirm",
            {
                method: "POST",
                // starts a real deposit, needs a fresh DB check
                use: [sensitiveSessionMiddleware],
                body: z.object({
                    id: z.string(),
                    phoneNumber: z.string().min(1),
                    provider: z.string().min(1),
                }),
            },
            async (ctx) => {
                const intent = await ctx.context.adapter.findOne<{
                    id: string
                    userId: string
                    clientId: string
                    status: PaymentIntentStatus
                    amount: string
                    currency: string
                    purpose: string | null
                }>({
                    model: "paymentIntent",
                    where: [{ field: "id", value: ctx.body.id }],
                })
                if (!intent || intent.userId !== ctx.context.session.user.id) {
                    throw new APIError("NOT_FOUND", {
                        message: "Payment intent not found",
                    })
                }
                if (intent.status !== "created") {
                    throw new APIError("BAD_REQUEST", {
                        message: "This payment has already been actioned",
                    })
                }

                const { paymentId, depositId, status, failureReason } =
                    await performDeposit(ctx, {
                        userId: intent.userId,
                        clientId: intent.clientId,
                        amount: intent.amount,
                        currency: intent.currency,
                        phoneNumber: ctx.body.phoneNumber,
                        provider: ctx.body.provider,
                        purpose: intent.purpose ?? undefined,
                    })

                await ctx.context.adapter.update({
                    model: "paymentIntent",
                    where: [{ field: "id", value: intent.id }],
                    update: {
                        paymentId,
                        // "pending" here mirrors payment.status: the
                        // webhook is what later flips this to completed/
                        // failed, same as it does for `payment` itself
                        status: status === "pending" ? "pending" : "failed",
                        ...(failureReason
                            ? { failureReason: JSON.stringify(failureReason) }
                            : {}),
                    },
                })

                return ctx.json({ depositId, status })
            }
        ),
        // admin/owner only — this is the platform cashing out to its
        // own operator's mobile-money account, not a user-facing action
        payoutPayment: createAuthEndpoint(
            "/pay/payout",
            {
                method: "POST",
                // moves real money out, needs a fresh DB check
                use: [sensitiveSessionMiddleware],
                body: z.object({
                    amount: z.string().min(1),
                    currency: z.string().length(3),
                    phoneNumber: z.string().min(1),
                    provider: z.string().min(1),
                    // PawaPay's customerMessage constraint: alphanumeric
                    // + space only, 4-22 chars (confirmed live — a "-"
                    // or anything under 4 chars gets REJECTED)
                    purpose: z
                        .string()
                        .min(4)
                        .max(22)
                        .regex(/^[a-zA-Z0-9 ]*$/)
                        .optional(),
                }),
            },
            async (ctx) => {
                if (!isAdmin(ctx.context.session.user.role ?? "")) {
                    throw new APIError("FORBIDDEN", {
                        message: "Admin access required",
                    })
                }

                const payoutId = crypto.randomUUID()

                const result = await client.initiatePayout({
                    payoutId,
                    recipient: {
                        type: "MMO",
                        accountDetails: {
                            phoneNumber: ctx.body.phoneNumber,
                            provider: ctx.body.provider,
                        },
                    },
                    amount: ctx.body.amount,
                    currency: ctx.body.currency,
                    clientReferenceId: payoutId,
                    ...(ctx.body.purpose && {
                        customerMessage: ctx.body.purpose,
                    }),
                })

                const status: PaymentStatus =
                    result.status === "ACCEPTED" ? "pending" : "failed"

                await ctx.context.adapter.create({
                    model: "payment",
                    data: {
                        userId: ctx.context.session.user.id,
                        type: "payout",
                        provider: ctx.body.provider,
                        phoneNumber: ctx.body.phoneNumber,
                        amount: ctx.body.amount,
                        currency: ctx.body.currency,
                        pawapayReferenceId: payoutId,
                        status,
                        failureReason: result.failureReason
                            ? JSON.stringify(result.failureReason)
                            : undefined,
                    },
                })

                return ctx.json({ payoutId, status })
            }
        ),
        // admin/owner only — reverses a completed deposit. Deliberately
        // doesn't gate on our own locally-stored status (it can lag
        // reality — the webhook that would flip pending -> completed
        // depends on PawaPay actually reaching us): PawaPay's own API
        // is the source of truth on whether the deposit is refundable,
        // and rejects cleanly with a failureReason if it isn't
        refundPayment: createAuthEndpoint(
            "/pay/refund",
            {
                method: "POST",
                // reverses a real deposit, needs a fresh DB check
                use: [sensitiveSessionMiddleware],
                body: z.object({
                    paymentId: z.string().min(1),
                    amount: z.string().min(1).optional(),
                    // PawaPay's customerMessage constraint: alphanumeric
                    // + space only, 4-22 chars (confirmed live — a "-"
                    // or anything under 4 chars gets REJECTED)
                    purpose: z
                        .string()
                        .min(4)
                        .max(22)
                        .regex(/^[a-zA-Z0-9 ]*$/)
                        .optional(),
                }),
            },
            async (ctx) => {
                if (!isAdmin(ctx.context.session.user.role ?? "")) {
                    throw new APIError("FORBIDDEN", {
                        message: "Admin access required",
                    })
                }

                const original = await ctx.context.adapter.findOne<{
                    id: string
                    userId: string
                    clientId: string | null
                    type: string
                    pawapayReferenceId: string
                    amount: string
                    currency: string
                }>({
                    model: "payment",
                    where: [{ field: "id", value: ctx.body.paymentId }],
                })
                if (!original) {
                    throw new APIError("NOT_FOUND", {
                        message: "Payment not found",
                    })
                }
                if (original.type !== "deposit") {
                    throw new APIError("BAD_REQUEST", {
                        message: "Only deposits can be refunded",
                    })
                }

                const refundId = crypto.randomUUID()
                const amount = ctx.body.amount ?? original.amount

                const result = await client.initiateRefund({
                    refundId,
                    depositId: original.pawapayReferenceId,
                    amount,
                    currency: original.currency,
                    clientReferenceId: refundId,
                })

                const status: PaymentStatus =
                    result.status === "ACCEPTED" ? "pending" : "failed"

                await ctx.context.adapter.create({
                    model: "payment",
                    data: {
                        userId: original.userId,
                        clientId: original.clientId,
                        type: "refund",
                        amount,
                        currency: original.currency,
                        pawapayReferenceId: refundId,
                        status,
                        failureReason: result.failureReason
                            ? JSON.stringify(result.failureReason)
                            : undefined,
                        metadata: JSON.stringify({
                            depositId: original.pawapayReferenceId,
                            originalPaymentId: original.id,
                        }),
                    },
                })

                return ctx.json({ refundId, status })
            }
        ),
        // public, hit by PawaPay's servers directly — every claim in
        // the body is untrusted until the RFC-9421 signature checks out
        paymentWebhook: createAuthEndpoint(
            "/pay/webhook",
            // cloneRequest: better-call clones the request for its own
            // internal body handling instead of consuming ctx.request's
            // stream directly — without this, ctx.request's body is
            // already locked by the time this handler runs (confirmed
            // live: "This ReadableStream is currently locked to a
            // reader"), and Content-Digest verification needs the
            // exact raw, unparsed bytes PawaPay actually signed
            { method: "POST", cloneRequest: true },
            async (ctx) => {
                if (!ctx.request) {
                    throw new APIError("BAD_REQUEST", {
                        message: "Missing request",
                    })
                }
                const rawBody = await ctx.request.text()

                const verified = await verifyPawaPayCallback(
                    ctx.request,
                    rawBody,
                    () => client.getPublicKeys()
                )
                if (!verified) {
                    throw new APIError("UNAUTHORIZED", {
                        message: "Invalid signature",
                    })
                }

                let payload: {
                    depositId?: string
                    payoutId?: string
                    refundId?: string
                    status?: string
                    failureReason?: unknown
                }
                try {
                    payload = JSON.parse(rawBody)
                } catch {
                    throw new APIError("BAD_REQUEST", {
                        message: "Invalid JSON body",
                    })
                }
                const referenceId =
                    payload.depositId ?? payload.payoutId ?? payload.refundId
                if (!referenceId) {
                    throw new APIError("BAD_REQUEST", {
                        message: "Missing depositId/payoutId/refundId",
                    })
                }

                const existing = await ctx.context.adapter.findOne<{
                    id: string
                    userId: string
                    type: string
                    provider: string | null
                    phoneNumber: string | null
                    amount: string
                    currency: string
                    pawapayReferenceId: string
                    status: string
                }>({
                    model: "payment",
                    where: [
                        {
                            field: "pawapayReferenceId",
                            value: referenceId,
                        },
                    ],
                })
                // unknown reference — ack anyway so PawaPay doesn't
                // retry forever on something we'll never recognize
                if (!existing) {
                    return ctx.json({ received: true })
                }

                const status: PaymentStatus =
                    payload.status === "COMPLETED"
                        ? "completed"
                        : payload.status === "FAILED"
                          ? "failed"
                          : "pending"

                await applyPaymentOutcome(
                    ctx,
                    existing,
                    status,
                    payload.failureReason
                )

                return ctx.json({ received: true })
            }
        ),
    }
}
