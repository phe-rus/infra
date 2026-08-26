import { createAuthEndpoint, sessionMiddleware, APIError } from "better-auth/api"
import type { signJWT } from "better-auth/plugins"
import * as z from "zod"
import type DodoPayments from "dodopayments"
import { createDodoCheckoutSession } from "../dodo/checkout"
import {
    listDodoPaymentMethods,
    removeDodoPaymentMethod as removeDodoPaymentMethodCall,
} from "../dodo/payment-methods"
import { getDodoCreditEntitlements } from "../dodo/credits"
import { verifyDodoWebhook } from "../dodo/verify-webhook"
import type { DodoOptions } from "../dodo/dodo-client"
import type { PaymentStatus } from "../pawapay/constants"
import type { PaymentReceiptInfo } from "./pawapay"

export type DodoEndpointsDeps = {
    dodoClient: DodoPayments | null
    dodo: DodoOptions | undefined
    isAdmin: (role: string) => boolean
    sendPaymentReceipt?: (
        email: string,
        receipt: PaymentReceiptInfo
    ) => Promise<void>
}

export function createDodoEndpoints(deps: DodoEndpointsDeps) {
    const { dodoClient, dodo, isAdmin, sendPaymentReceipt } = deps

    // find-or-create: every dodo endpoint needs the caller's own dodo
    // customer_id, Dodo's API is keyed by that, not by our own userId
    async function findOrCreateDodoCustomer(
        ctx: Parameters<typeof signJWT>[0],
        user: { id: string; email: string; name: string }
    ): Promise<string> {
        if (!dodoClient) {
            throw new APIError("NOT_FOUND", {
                message: "Dodo payments are not configured on this instance",
            })
        }

        const existing = await ctx.context.adapter.findOne<{
            dodoCustomerId: string
        }>({
            model: "dodoCustomer",
            where: [{ field: "userId", value: user.id }],
        })
        if (existing) return existing.dodoCustomerId

        const customer = await dodoClient.customers.create({
            email: user.email,
            name: user.name,
        })
        await ctx.context.adapter.create({
            model: "dodoCustomer",
            data: {
                userId: user.id,
                dodoCustomerId: customer.customer_id,
            },
        })
        return customer.customer_id
    }

    return {
        // self-service: session-gated, initiated from infra's own
        // dashboard/www. Optionally fulfills an existing paymentIntent
        // (created by a connected app via createPaymentIntent) instead of
        // a one-off deposit — same dual role performDeposit/
        // confirmPaymentIntent split between them for pawapay, just one
        // endpoint here since dodo checkout has no separate "deposit
        // immediately" case today. Creates the payment row immediately in
        // "pending" state — dodoWebhook/dodoSync is what later flips it
        // to completed/failed, and carries the intent along with it
        dodoCheckout: createAuthEndpoint(
            "/pay/dodo-checkout",
            {
                method: "POST",
                use: [sessionMiddleware],
                body: z.object({
                    amount: z.number().int().positive(),
                    currency: z.string().length(3),
                    purpose: z.string().optional(),
                    returnUrl: z.string().url(),
                    grantsCredits: z.boolean().optional(),
                    intentId: z.string().optional(),
                }),
            },
            async (ctx) => {
                if (!dodoClient || !dodo) {
                    throw new APIError("NOT_FOUND", {
                        message:
                            "Dodo payments are not configured on this instance",
                    })
                }

                let amount = ctx.body.amount
                let currency = ctx.body.currency
                let purpose = ctx.body.purpose
                let intent: {
                    id: string
                    clientId: string
                } | null = null

                if (ctx.body.intentId) {
                    const found = await ctx.context.adapter.findOne<{
                        id: string
                        userId: string
                        clientId: string
                        amount: string
                        currency: string
                        purpose: string | null
                        status: string
                    }>({
                        model: "paymentIntent",
                        where: [{ field: "id", value: ctx.body.intentId }],
                    })
                    if (!found || found.userId !== ctx.context.session.user.id) {
                        throw new APIError("NOT_FOUND", {
                            message: "Payment intent not found",
                        })
                    }
                    if (found.status !== "created") {
                        throw new APIError("BAD_REQUEST", {
                            message: "This payment has already been actioned",
                        })
                    }
                    // trust the intent's own stored amount/currency/purpose,
                    // not whatever the client happened to send alongside it
                    amount = Math.round(Number(found.amount) * 100)
                    currency = found.currency
                    purpose = found.purpose ?? undefined
                    intent = { id: found.id, clientId: found.clientId }
                }

                const customerId = await findOrCreateDodoCustomer(
                    ctx,
                    ctx.context.session.user
                )

                const { sessionId, checkoutUrl } = await createDodoCheckoutSession(
                    dodoClient,
                    {
                        checkoutId: dodo.checkoutId,
                        creditEntitlementId: dodo.creditEntitlementId,
                        customerId,
                        amount,
                        returnUrl: ctx.body.returnUrl,
                        // an intent fulfillment is never a credits top-up
                        grantsCredits: intent
                            ? false
                            : (ctx.body.grantsCredits ?? false),
                    }
                )

                const payment = await ctx.context.adapter.create<{
                    id: string
                }>({
                    model: "payment",
                    data: {
                        userId: ctx.context.session.user.id,
                        clientId: intent?.clientId ?? null,
                        rail: "dodo",
                        type: "deposit",
                        // Dodo's amount is the lowest-denomination
                        // integer (cents) — payment.amount is a decimal
                        // string everywhere else in this table, so
                        // convert once here rather than downstream
                        amount: (amount / 100).toFixed(2),
                        currency,
                        dodoReferenceId: sessionId,
                        status: "pending",
                        metadata: purpose
                            ? JSON.stringify({ purpose })
                            : undefined,
                    },
                })

                if (intent) {
                    await ctx.context.adapter.update({
                        model: "paymentIntent",
                        where: [{ field: "id", value: intent.id }],
                        update: { paymentId: payment.id, status: "pending" },
                    })
                }

                return ctx.json({ url: checkoutUrl })
            }
        ),
        // public, hit by Dodo's servers directly — every claim in the
        // body is untrusted until the HMAC signature checks out,
        // mirrors paymentWebhook's shape exactly, just a different
        // provider's signature scheme and payload format
        dodoWebhook: createAuthEndpoint(
            "/pay/dodo-webhook",
            { method: "POST", cloneRequest: true },
            async (ctx) => {
                if (!dodoClient || !dodo) {
                    throw new APIError("NOT_FOUND", {
                        message:
                            "Dodo payments are not configured on this instance",
                    })
                }
                if (!ctx.request) {
                    throw new APIError("BAD_REQUEST", {
                        message: "Missing request",
                    })
                }
                const rawBody = await ctx.request.text()
                const headers = Object.fromEntries(
                    ctx.request.headers.entries()
                )

                const payload = await verifyDodoWebhook(
                    dodo.webhookSecret,
                    headers,
                    rawBody
                )
                if (!payload) {
                    throw new APIError("UNAUTHORIZED", {
                        message: "Invalid signature",
                    })
                }

                // only payment events update our own ledger for now —
                // subscription/refund/dispute events are outside this
                // rail's current scope. The SDK's WebhookPayload is a
                // large generated discriminated union that TS won't
                // narrow cleanly through property-chain access, so this
                // reads it the same pragmatic way the pawapay webhook
                // handler above reads its own untyped JSON payload
                const data = payload.data as {
                    payload_type?: string
                    checkout_session_id?: string | null
                    status?: string
                    total_amount?: number
                    currency?: string
                }
                if (data.payload_type !== "Payment") {
                    return ctx.json({ received: true })
                }

                const referenceId = data.checkout_session_id
                if (!referenceId) {
                    return ctx.json({ received: true })
                }

                const existing = await ctx.context.adapter.findOne<{
                    id: string
                    userId: string
                    status: string
                }>({
                    model: "payment",
                    where: [
                        {
                            field: "dodoReferenceId",
                            value: referenceId,
                        },
                    ],
                })
                // unknown reference — ack anyway so Dodo doesn't retry
                // forever on something we'll never recognize
                if (!existing) {
                    return ctx.json({ received: true })
                }

                const status: PaymentStatus =
                    data.status === "succeeded"
                        ? "completed"
                        : data.status === "failed" || data.status === "cancelled"
                          ? "failed"
                          : "pending"

                await ctx.context.adapter.update({
                    model: "payment",
                    where: [{ field: "id", value: existing.id }],
                    update: { status },
                })

                // this deposit may have been made against a redirect-
                // checkout intent (dodoCheckout set payment.id on it),
                // carry the same real outcome over so the confirm page's
                // poll of /pay/intent/get sees it and can finish the flow
                if (status === "completed" || status === "failed") {
                    await ctx.context.adapter.updateMany({
                        model: "paymentIntent",
                        where: [{ field: "paymentId", value: existing.id }],
                        update: { status },
                    })
                }

                // only the first time this reference transitions to
                // completed — Dodo can retry a webhook delivery, and
                // this shouldn't email a receipt twice for the same payment
                if (
                    status === "completed" &&
                    existing.status !== "completed" &&
                    sendPaymentReceipt
                ) {
                    const user = await ctx.context.internalAdapter.findUserById(
                        existing.userId
                    )
                    if (user) {
                        await sendPaymentReceipt(user.email, {
                            userName: user.name,
                            email: user.email,
                            type: "deposit",
                            amount: ((data.total_amount ?? 0) / 100).toFixed(2),
                            currency: data.currency ?? "",
                            provider: null,
                            phoneNumber: null,
                            referenceId,
                            date: new Date().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            }),
                        }).catch((error) => {
                            // a failed receipt email shouldn't fail the
                            // webhook ack — Dodo would just retry
                            // delivery forever on a 500
                            ctx.context.logger.error(
                                "Failed to send payment receipt email",
                                error
                            )
                        })
                    }
                }

                return ctx.json({ received: true })
            }
        ),
        // self-service: reconciles one of the caller's own dodo payments
        // against Dodo's API directly. Needed because dodoWebhook can't
        // reach a local dev instance (Dodo's servers can't call
        // localhost) — the return URL Dodo redirects to after checkout
        // carries a payment_id as a UI hint, but per Dodo's own docs
        // that's not proof of anything, so this looks the payment back
        // up for real before trusting it
        dodoSync: createAuthEndpoint(
            "/pay/dodo-sync",
            {
                method: "POST",
                use: [sessionMiddleware],
                body: z.object({ dodoPaymentId: z.string().min(1) }),
            },
            async (ctx) => {
                if (!dodoClient) {
                    throw new APIError("NOT_FOUND", {
                        message:
                            "Dodo payments are not configured on this instance",
                    })
                }

                const dodoPayment = await dodoClient.payments.retrieve(
                    ctx.body.dodoPaymentId
                )
                const referenceId = dodoPayment.checkout_session_id
                if (!referenceId) {
                    return ctx.json({ status: "pending" as PaymentStatus })
                }

                const existing = await ctx.context.adapter.findOne<{
                    id: string
                    status: string
                }>({
                    model: "payment",
                    where: [
                        { field: "dodoReferenceId", value: referenceId },
                        {
                            field: "userId",
                            value: ctx.context.session.user.id,
                        },
                    ],
                })
                if (!existing) {
                    throw new APIError("NOT_FOUND", {
                        message: "Payment not found",
                    })
                }

                const status: PaymentStatus =
                    dodoPayment.status === "succeeded"
                        ? "completed"
                        : dodoPayment.status === "failed" ||
                            dodoPayment.status === "cancelled"
                          ? "failed"
                          : "pending"

                if (status !== existing.status) {
                    await ctx.context.adapter.update({
                        model: "payment",
                        where: [{ field: "id", value: existing.id }],
                        update: { status },
                    })

                    if (status === "completed" || status === "failed") {
                        await ctx.context.adapter.updateMany({
                            model: "paymentIntent",
                            where: [
                                { field: "paymentId", value: existing.id },
                            ],
                            update: { status },
                        })
                    }
                }

                return ctx.json({ status })
            }
        ),
        // self-service: the signed-in user's own saved cards
        dodoPaymentMethods: createAuthEndpoint(
            "/pay/dodo-payment-methods",
            { method: "GET", use: [sessionMiddleware] },
            async (ctx) => {
                if (!dodoClient) {
                    throw new APIError("NOT_FOUND", {
                        message:
                            "Dodo payments are not configured on this instance",
                    })
                }

                const customerId = await findOrCreateDodoCustomer(
                    ctx,
                    ctx.context.session.user
                )
                const paymentMethods = await listDodoPaymentMethods(
                    dodoClient,
                    customerId
                )
                return ctx.json({ paymentMethods })
            }
        ),
        removeDodoPaymentMethod: createAuthEndpoint(
            "/pay/dodo-payment-methods/remove",
            {
                method: "POST",
                use: [sessionMiddleware],
                body: z.object({
                    paymentMethodId: z.string().min(1),
                }),
            },
            async (ctx) => {
                if (!dodoClient) {
                    throw new APIError("NOT_FOUND", {
                        message:
                            "Dodo payments are not configured on this instance",
                    })
                }

                const dodoCustomer = await ctx.context.adapter.findOne<{
                    dodoCustomerId: string
                }>({
                    model: "dodoCustomer",
                    where: [
                        {
                            field: "userId",
                            value: ctx.context.session.user.id,
                        },
                    ],
                })
                if (!dodoCustomer) {
                    throw new APIError("NOT_FOUND", {
                        message: "No saved payment methods",
                    })
                }

                await removeDodoPaymentMethodCall(
                    dodoClient,
                    ctx.body.paymentMethodId,
                    dodoCustomer.dodoCustomerId
                )

                return ctx.json({ removed: true })
            }
        ),
        // self-service: the signed-in user's own credit balance
        dodoBalance: createAuthEndpoint(
            "/pay/dodo-balance",
            { method: "GET", use: [sessionMiddleware] },
            async (ctx) => {
                if (!dodoClient) {
                    throw new APIError("NOT_FOUND", {
                        message:
                            "Dodo payments are not configured on this instance",
                    })
                }

                const dodoCustomer = await ctx.context.adapter.findOne<{
                    dodoCustomerId: string
                }>({
                    model: "dodoCustomer",
                    where: [
                        {
                            field: "userId",
                            value: ctx.context.session.user.id,
                        },
                    ],
                })
                // no dodo customer yet — never checked out, so there's
                // no balance to report rather than an error
                if (!dodoCustomer) {
                    return ctx.json({ entitlements: [] })
                }

                const entitlements = await getDodoCreditEntitlements(
                    dodoClient,
                    dodoCustomer.dodoCustomerId
                )
                return ctx.json({ entitlements })
            }
        ),
        // admin-only: reads another user's dodo payment methods, for
        // the admin drawer's Wallet tab
        adminDodoPaymentMethods: createAuthEndpoint(
            "/pay/admin/dodo-payment-methods",
            {
                method: "GET",
                use: [sessionMiddleware],
                query: z.object({ userId: z.string() }),
            },
            async (ctx) => {
                if (!dodoClient) {
                    throw new APIError("NOT_FOUND", {
                        message:
                            "Dodo payments are not configured on this instance",
                    })
                }
                if (!isAdmin(ctx.context.session.user.role ?? "")) {
                    throw new APIError("FORBIDDEN", {
                        message: "Admin access required",
                    })
                }

                const dodoCustomer = await ctx.context.adapter.findOne<{
                    dodoCustomerId: string
                }>({
                    model: "dodoCustomer",
                    where: [{ field: "userId", value: ctx.query.userId }],
                })
                if (!dodoCustomer) {
                    return ctx.json({ paymentMethods: [] })
                }

                const paymentMethods = await listDodoPaymentMethods(
                    dodoClient,
                    dodoCustomer.dodoCustomerId
                )
                return ctx.json({ paymentMethods })
            }
        ),
        // admin-only: reads another user's dodo credit balance, for
        // the admin drawer's Wallet tab
        adminDodoBalance: createAuthEndpoint(
            "/pay/admin/dodo-balance",
            {
                method: "GET",
                use: [sessionMiddleware],
                query: z.object({ userId: z.string() }),
            },
            async (ctx) => {
                if (!dodoClient) {
                    throw new APIError("NOT_FOUND", {
                        message:
                            "Dodo payments are not configured on this instance",
                    })
                }
                if (!isAdmin(ctx.context.session.user.role ?? "")) {
                    throw new APIError("FORBIDDEN", {
                        message: "Admin access required",
                    })
                }

                const dodoCustomer = await ctx.context.adapter.findOne<{
                    dodoCustomerId: string
                }>({
                    model: "dodoCustomer",
                    where: [{ field: "userId", value: ctx.query.userId }],
                })
                if (!dodoCustomer) {
                    return ctx.json({ entitlements: [] })
                }

                const entitlements = await getDodoCreditEntitlements(
                    dodoClient,
                    dodoCustomer.dodoCustomerId
                )
                return ctx.json({ entitlements })
            }
        ),
        // admin/owner only — this is the whole business's balance at
        // Dodo, not a per-user one, mirrors walletBalances (pawapay's own
        // merchant balance). Dodo has no single "current balance" call:
        // it's a ledger of individual events, so this takes the most
        // recent entry per currency and reads its own after_balance
        adminDodoMerchantBalance: createAuthEndpoint(
            "/pay/admin/dodo-merchant-balance",
            { method: "GET", use: [sessionMiddleware] },
            async (ctx) => {
                if (!dodoClient) {
                    throw new APIError("NOT_FOUND", {
                        message:
                            "Dodo payments are not configured on this instance",
                    })
                }
                if (!isAdmin(ctx.context.session.user.role ?? "")) {
                    throw new APIError("FORBIDDEN", {
                        message: "Admin access required",
                    })
                }

                const ledger = await dodoClient.balances.retrieveLedger({
                    limit: 100,
                })
                const latestByCurrency = new Map<
                    string,
                    { created_at: string; after_balance: number }
                >()
                for (const entry of ledger.items) {
                    if (entry.after_balance == null) continue
                    const existing = latestByCurrency.get(entry.currency)
                    if (
                        !existing ||
                        entry.created_at > existing.created_at
                    ) {
                        latestByCurrency.set(entry.currency, {
                            created_at: entry.created_at,
                            after_balance: entry.after_balance,
                        })
                    }
                }

                return ctx.json({
                    balances: [...latestByCurrency.entries()].map(
                        ([currency, { after_balance }]) => ({
                            currency,
                            balance: after_balance,
                        })
                    ),
                })
            }
        ),
    }
}
