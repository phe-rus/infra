import { createAuthEndpoint, sessionMiddleware, APIError } from "better-auth/api"
import * as z from "zod"
import { schema } from "./schema"
import { PawaPayClient, type PawaPayEnvironment } from "./client"
import { verifyPawaPayCallback } from "./verify-signature"
import { toPaymentCountryOptions, type PaymentCountryOption } from "./active-config"
import { convertViaUsd, fetchUsdRates, type FxRates } from "./fx"
import type { PaymentStatus } from "./constants"

const ACTIVE_CONFIG_CACHE_KEY = "infra-payment:active-conf:v1"
const ACTIVE_CONFIG_CACHE_TTL = 60 * 60 // 1 hour — PawaPay's own provider list changes rarely

const FX_CACHE_KEY = "infra-payment:fx-rates:v1"
const FX_CACHE_TTL = 60 * 60 * 12 // 12 hours — the upstream rate table itself only updates once a day

export type PaymentReceiptInfo = {
    userName: string
    type: "deposit" | "payout" | "refund"
    amount: string
    currency: string
    provider: string | null
    phoneNumber: string | null
    referenceId: string
    date: string
}

export type InfraPaymentOptions = {
    /** PawaPay API token — sandbox or production, from their dashboard. */
    apiToken: string
    environment: PawaPayEnvironment
    /** KV binding used to cache PawaPay's country/provider list — avoids re-fetching it on every page load. */
    cache: KVNamespace
    /** Whether a given role has admin-tier access — the caller's own role model, not assumed here. */
    isAdmin: (role: string) => boolean
    /** Called once, the first time a payment transitions to "completed" — e.g. to email a receipt. Optional: not every self-hoster wants this. */
    onPaymentCompleted?: (email: string, receipt: PaymentReceiptInfo) => Promise<void>
}

export function infraPayment(options: InfraPaymentOptions) {
    const { isAdmin, onPaymentCompleted } = options
    const client = new PawaPayClient(options.apiToken, options.environment)

    // shared by both the session-gated /pay/config (used by the deposit/
    // payout forms) and the public /pay/countries.jsonc endpoint below —
    // same cache entry, populated lazily by whichever request hits it
    // first after the previous entry expired
    async function getCachedCountries(): Promise<PaymentCountryOption[]> {
        const cached = await options.cache.get(ACTIVE_CONFIG_CACHE_KEY)
        if (cached) return JSON.parse(cached) as PaymentCountryOption[]

        const raw = await client.getActiveConfig()
        const countries = toPaymentCountryOptions(raw)
        await options.cache.put(ACTIVE_CONFIG_CACHE_KEY, JSON.stringify(countries), {
            expirationTtl: ACTIVE_CONFIG_CACHE_TTL,
        })
        return countries
    }

    return {
        id: "pawapay",
        schema,
        endpoints: {
            // any signed-in user — the deposit/payout forms need this to
            // populate a country/provider picker, not just admins
            paymentConfig: createAuthEndpoint(
                "/pay/config",
                { method: "GET", use: [sessionMiddleware] },
                async (ctx) => {
                    return ctx.json({ countries: await getCachedCountries() })
                }
            ),
            // admin/owner only — this is the platform's real money sitting
            // at PawaPay, not something a plain user should see. The
            // balances themselves are never cached (they change with every
            // transaction); only the USD FX rate table used to combine
            // them into one total is
            walletBalances: createAuthEndpoint(
                "/pay/balances",
                { method: "GET", use: [sessionMiddleware], query: z.object({ currency: z.string().length(3).optional() }) },
                async (ctx) => {
                    if (!isAdmin(ctx.context.session.user.role ?? "")) {
                        throw new APIError("FORBIDDEN", { message: "Admin access required" })
                    }
                    const { balances } = await client.getWalletBalances()

                    if (!ctx.query.currency) {
                        return ctx.json({ balances, total: null })
                    }

                    const cachedRates = await options.cache.get(FX_CACHE_KEY)
                    const usdRates: FxRates = cachedRates
                        ? JSON.parse(cachedRates)
                        : await fetchUsdRates().then(async (rates) => {
                              await options.cache.put(FX_CACHE_KEY, JSON.stringify(rates), { expirationTtl: FX_CACHE_TTL })
                              return rates
                          })

                    const targetCurrency = ctx.query.currency.toUpperCase()
                    let amount = 0
                    const unconvertedCurrencies: string[] = []
                    for (const balance of balances) {
                        const converted = convertViaUsd(Number(balance.balance), balance.currency, targetCurrency, usdRates)
                        if (converted === null) {
                            unconvertedCurrencies.push(balance.currency)
                            continue
                        }
                        amount += converted
                    }

                    return ctx.json({
                        balances,
                        total: { currency: targetCurrency, amount, unconvertedCurrencies },
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
                        provider: string | null
                        phoneNumber: string | null
                        amount: string
                        currency: string
                        pawapayReferenceId: string
                        status: string
                        failureReason: string | null
                        metadata: string | null
                        createdAt: Date
                        updatedAt: Date
                    }>({
                        model: "payment",
                        where: [{ field: "userId", value: ctx.context.session.user.id }],
                        sortBy: { field: "createdAt", direction: "desc" },
                    })
                    return ctx.json({ payments })
                }
            ),
            // self-service: re-sends the receipt email for one of the
            // caller's own completed payments, reusing the same
            // onPaymentCompleted callback the webhook fires on first
            // completion — just triggered on demand instead of by a status
            // transition
            resendReceipt: createAuthEndpoint(
                "/pay/receipt/resend",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    body: z.object({ paymentId: z.string().min(1) }),
                },
                async (ctx) => {
                    if (!onPaymentCompleted) {
                        throw new APIError("BAD_REQUEST", { message: "Receipt emails are not configured on this instance" })
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
                        throw new APIError("NOT_FOUND", { message: "Payment not found" })
                    }
                    if (payment.status !== "completed") {
                        throw new APIError("BAD_REQUEST", { message: "Only completed payments have a receipt" })
                    }

                    await onPaymentCompleted(ctx.context.session.user.email, {
                        userName: ctx.context.session.user.name,
                        type: payment.type as "deposit" | "payout" | "refund",
                        amount: payment.amount,
                        currency: payment.currency,
                        provider: payment.provider,
                        phoneNumber: payment.phoneNumber,
                        referenceId: payment.pawapayReferenceId,
                        date: new Date(payment.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }),
                    })

                    return ctx.json({ sent: true })
                }
            ),
            // self-service: the signed-in user's own saved mobile-money
            // numbers — separate from a payment's own phoneNumber, this is
            // what backs the "Primary" wallet card and lets the deposit form
            // skip retyping a number every time
            listWalletNumbers: createAuthEndpoint(
                "/pay/wallets",
                { method: "GET", use: [sessionMiddleware] },
                async (ctx) => {
                    const wallets = await ctx.context.adapter.findMany<{
                        id: string
                        userId: string
                        phoneNumber: string
                        provider: string
                        label: string | null
                        isPrimary: boolean
                        createdAt: Date
                        updatedAt: Date
                    }>({
                        model: "walletNumber",
                        where: [{ field: "userId", value: ctx.context.session.user.id }],
                        sortBy: { field: "createdAt", direction: "desc" },
                    })
                    // primary pinned to the top, most recently added first otherwise
                    wallets.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
                    return ctx.json({ wallets })
                }
            ),
            addWalletNumber: createAuthEndpoint(
                "/pay/wallets/add",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    body: z.object({
                        phoneNumber: z.string().min(1),
                        provider: z.string().min(1),
                        label: z.string().min(1).max(40).optional(),
                        makePrimary: z.boolean().optional(),
                    }),
                },
                async (ctx) => {
                    const userId = ctx.context.session.user.id
                    const existing = await ctx.context.adapter.findMany({
                        model: "walletNumber",
                        where: [{ field: "userId", value: userId }],
                    })
                    // the first saved number is always primary, regardless of the flag
                    const isPrimary = existing.length === 0 || Boolean(ctx.body.makePrimary)

                    if (isPrimary && existing.length > 0) {
                        await ctx.context.adapter.updateMany({
                            model: "walletNumber",
                            where: [
                                { field: "userId", value: userId },
                                { field: "isPrimary", value: true },
                            ],
                            update: { isPrimary: false },
                        })
                    }

                    const wallet = await ctx.context.adapter.create({
                        model: "walletNumber",
                        data: {
                            userId,
                            phoneNumber: ctx.body.phoneNumber,
                            provider: ctx.body.provider,
                            label: ctx.body.label,
                            isPrimary,
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
                        throw new APIError("NOT_FOUND", { message: "Saved number not found" })
                    }

                    await ctx.context.adapter.delete({
                        model: "walletNumber",
                        where: [{ field: "id", value: wallet.id }],
                    })

                    // removing the primary number promotes the most recently
                    // added remaining one, so the user is never left without one
                    if (wallet.isPrimary) {
                        const remaining = await ctx.context.adapter.findMany<{ id: string }>({
                            model: "walletNumber",
                            where: [{ field: "userId", value: userId }],
                            sortBy: { field: "createdAt", direction: "desc" },
                            limit: 1,
                        })
                        if (remaining[0]) {
                            await ctx.context.adapter.update({
                                model: "walletNumber",
                                where: [{ field: "id", value: remaining[0].id }],
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
                    const wallet = await ctx.context.adapter.findOne<{ id: string; userId: string }>({
                        model: "walletNumber",
                        where: [{ field: "id", value: ctx.body.walletId }],
                    })
                    if (!wallet || wallet.userId !== userId) {
                        throw new APIError("NOT_FOUND", { message: "Saved number not found" })
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
            // self-service: the signed-in user is the payer. clientId is
            // which connected OAuth app requested this payment, if any —
            // a dashboard-initiated deposit has none
            depositPayment: createAuthEndpoint(
                "/pay/deposit",
                {
                    method: "POST",
                    use: [sessionMiddleware],
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
                    const depositId = crypto.randomUUID()

                    const result = await client.initiateDeposit({
                        depositId,
                        payer: {
                            type: "MMO",
                            accountDetails: { phoneNumber: ctx.body.phoneNumber, provider: ctx.body.provider },
                        },
                        amount: ctx.body.amount,
                        currency: ctx.body.currency,
                        clientReferenceId: depositId,
                        ...(ctx.body.purpose && { customerMessage: ctx.body.purpose }),
                    })

                    // ACCEPTED just means PawaPay took the request for
                    // processing — the real outcome (completed/failed)
                    // only ever arrives later via the signed webhook
                    const status: PaymentStatus = result.status === "ACCEPTED" ? "pending" : "failed"

                    await ctx.context.adapter.create({
                        model: "payment",
                        data: {
                            userId: ctx.context.session.user.id,
                            clientId: ctx.body.clientId,
                            type: "deposit",
                            provider: ctx.body.provider,
                            phoneNumber: ctx.body.phoneNumber,
                            amount: ctx.body.amount,
                            currency: ctx.body.currency,
                            pawapayReferenceId: depositId,
                            status,
                            failureReason: result.failureReason ? JSON.stringify(result.failureReason) : undefined,
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
                    use: [sessionMiddleware],
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
                        throw new APIError("FORBIDDEN", { message: "Admin access required" })
                    }

                    const payoutId = crypto.randomUUID()

                    const result = await client.initiatePayout({
                        payoutId,
                        recipient: {
                            type: "MMO",
                            accountDetails: { phoneNumber: ctx.body.phoneNumber, provider: ctx.body.provider },
                        },
                        amount: ctx.body.amount,
                        currency: ctx.body.currency,
                        clientReferenceId: payoutId,
                        ...(ctx.body.purpose && { customerMessage: ctx.body.purpose }),
                    })

                    const status: PaymentStatus = result.status === "ACCEPTED" ? "pending" : "failed"

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
                            failureReason: result.failureReason ? JSON.stringify(result.failureReason) : undefined,
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
                    use: [sessionMiddleware],
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
                        throw new APIError("FORBIDDEN", { message: "Admin access required" })
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
                        throw new APIError("NOT_FOUND", { message: "Payment not found" })
                    }
                    if (original.type !== "deposit") {
                        throw new APIError("BAD_REQUEST", { message: "Only deposits can be refunded" })
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

                    const status: PaymentStatus = result.status === "ACCEPTED" ? "pending" : "failed"

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
                            failureReason: result.failureReason ? JSON.stringify(result.failureReason) : undefined,
                            metadata: JSON.stringify({ depositId: original.pawapayReferenceId, originalPaymentId: original.id }),
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
                        throw new APIError("BAD_REQUEST", { message: "Missing request" })
                    }
                    const rawBody = await ctx.request.text()

                    const verified = await verifyPawaPayCallback(ctx.request, rawBody, () => client.getPublicKeys())
                    if (!verified) {
                        throw new APIError("UNAUTHORIZED", { message: "Invalid signature" })
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
                        throw new APIError("BAD_REQUEST", { message: "Invalid JSON body" })
                    }
                    const referenceId = payload.depositId ?? payload.payoutId ?? payload.refundId
                    if (!referenceId) {
                        throw new APIError("BAD_REQUEST", { message: "Missing depositId/payoutId/refundId" })
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
                        where: [{ field: "pawapayReferenceId", value: referenceId }],
                    })
                    // unknown reference — ack anyway so PawaPay doesn't
                    // retry forever on something we'll never recognize
                    if (!existing) {
                        return ctx.json({ received: true })
                    }

                    const status: PaymentStatus =
                        payload.status === "COMPLETED" ? "completed" : payload.status === "FAILED" ? "failed" : "pending"

                    await ctx.context.adapter.update({
                        model: "payment",
                        where: [{ field: "id", value: existing.id }],
                        update: {
                            status,
                            ...(payload.failureReason
                                ? { failureReason: JSON.stringify(payload.failureReason) }
                                : {}),
                        },
                    })

                    // only the first time this reference transitions to
                    // completed — PawaPay can retry a webhook delivery, and
                    // this shouldn't email a receipt twice for the same payment
                    if (status === "completed" && existing.status !== "completed" && onPaymentCompleted) {
                        const user = await ctx.context.internalAdapter.findUserById(existing.userId)
                        if (user) {
                            await onPaymentCompleted(user.email, {
                                userName: user.name,
                                type: existing.type as "deposit" | "payout" | "refund",
                                amount: existing.amount,
                                currency: existing.currency,
                                provider: existing.provider,
                                phoneNumber: existing.phoneNumber,
                                referenceId: existing.pawapayReferenceId,
                                date: new Date().toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                }),
                            }).catch((error) => {
                                // a failed receipt email shouldn't fail the
                                // webhook ack — PawaPay would just retry
                                // delivery forever on a 500
                                ctx.context.logger.error("Failed to send payment receipt email", error)
                            })
                        }
                    }

                    return ctx.json({ received: true })
                }
            ),
        },
    }
}
