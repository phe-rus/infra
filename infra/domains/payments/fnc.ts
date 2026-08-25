import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import * as z from "zod"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/lib/forward-headers"
import { AdminMiddleware, SessionMiddleware } from "@/middleware"
import {
    listPaymentsSchema,
    payoutSchema,
    refundSchema,
    walletBalancesSchema,
} from "./schema"

type PaymentRow = {
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
}

type UserStub = {
    id: string
    name: string
    email: string
}

const PAYMENT_SELECT = [
    "id",
    "userId",
    "clientId",
    "type",
    "provider",
    "phoneNumber",
    "amount",
    "currency",
    "pawapayReferenceId",
    "status",
    "failureReason",
    "metadata",
    "createdAt",
    "updatedAt",
] as const

function toPayment(row: PaymentRow, user?: Pick<UserStub, "name" | "email">) {
    return {
        id: row.id,
        userId: row.userId,
        userName: user?.name ?? null,
        userEmail: user?.email ?? null,
        clientId: row.clientId,
        type: row.type,
        provider: row.provider,
        phoneNumber: row.phoneNumber,
        amount: row.amount,
        currency: row.currency,
        referenceId: row.pawapayReferenceId,
        status: row.status,
        failureReason: row.failureReason,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }
}

// admin: every payment across every user, for the Billing page — attaches
// each payer's name/email with one follow-up query rather than one-per-row
export const listPayments = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(listPaymentsSchema)
    .handler(async ({ data }) => {
        const ctx = await auth.$context
        const rows = await ctx.adapter.findMany<PaymentRow>({
            model: "payment",
            where: [
                ...(data.userId
                    ? [{ field: "userId", value: data.userId }]
                    : []),
                ...(data.type ? [{ field: "type", value: data.type }] : []),
                ...(data.status
                    ? [{ field: "status", value: data.status }]
                    : []),
            ],
            sortBy: { field: "createdAt", direction: "desc" },
            select: [...PAYMENT_SELECT],
        })

        const userIds = [...new Set(rows.map((row) => row.userId))]
        const users = userIds.length
            ? await ctx.adapter.findMany<UserStub>({
                  model: "user",
                  where: [{ field: "id", operator: "in", value: userIds }],
                  select: ["id", "name", "email"],
              })
            : []
        const userById = new Map(users.map((user) => [user.id, user]))

        return {
            payments: rows.map((row) =>
                toPayment(row, userById.get(row.userId))
            ),
        }
    })

export type PaymentListData = Awaited<ReturnType<typeof listPayments>>
export type ListedPayment = PaymentListData["payments"][number]

function parseOriginalPaymentId(metadata: string | null): string | null {
    if (!metadata) return null
    try {
        const parsed = JSON.parse(metadata) as { originalPaymentId?: string }
        return parsed.originalPaymentId ?? null
    } catch {
        return null
    }
}

// admin: one payment's full detail, for the receipt page — a refund also
// carries the deposit it reversed, a deposit also carries any refunds
// against it (metadata isn't indexed, so the reverse lookup filters in
// memory rather than in the query — fine at this table's size)
export const findPayment = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(z.object({ paymentId: z.string().min(1) }))
    .handler(async ({ data }) => {
        const ctx = await auth.$context
        const row = await ctx.adapter.findOne<PaymentRow>({
            model: "payment",
            where: [{ field: "id", value: data.paymentId }],
            select: [...PAYMENT_SELECT],
        })
        if (!row) return null

        const user = await ctx.adapter.findOne<UserStub>({
            model: "user",
            where: [{ field: "id", value: row.userId }],
            select: ["id", "name", "email"],
        })
        const payment = toPayment(row, user ?? undefined)

        let relatedDeposit: ListedPayment | null = null
        const originalPaymentId = parseOriginalPaymentId(row.metadata)
        if (row.type === "refund" && originalPaymentId) {
            const depositRow = await ctx.adapter.findOne<PaymentRow>({
                model: "payment",
                where: [{ field: "id", value: originalPaymentId }],
                select: [...PAYMENT_SELECT],
            })
            if (depositRow) relatedDeposit = toPayment(depositRow)
        }

        let refunds: ListedPayment[] = []
        if (row.type === "deposit") {
            // metadata isn't indexed/queryable directly (D1/SQLite, no JSONB
            // operators to push this filter into the query), so the match is
            // still found in memory — but only `id`+`metadata` are fetched
            // for every refund row to find it, not the full row, then only
            // the actual matches (typically 0-1) are fetched in full
            const refundStubs = await ctx.adapter.findMany<
                Pick<PaymentRow, "id" | "metadata">
            >({
                model: "payment",
                where: [{ field: "type", value: "refund" }],
                select: ["id", "metadata"],
            })
            const matchingIds = refundStubs
                .filter((r) => parseOriginalPaymentId(r.metadata) === row.id)
                .map((r) => r.id)

            const refundRows = matchingIds.length
                ? await ctx.adapter.findMany<PaymentRow>({
                      model: "payment",
                      where: [
                          { field: "id", operator: "in", value: matchingIds },
                      ],
                      select: [...PAYMENT_SELECT],
                  })
                : []
            refunds = refundRows.map((r) => toPayment(r))
        }

        return { payment, relatedDeposit, refunds }
    })

export type PaymentDetail = Awaited<ReturnType<typeof findPayment>>

// any signed-in user — backs the country/provider picker on the admin
// payout dialog
export const getPaymentConfig = createServerFn({ method: "GET" })
    .middleware([SessionMiddleware])
    .handler(async () => {
        const headers = getRequestHeaders()
        const response = await auth.api.paymentConfig({ headers })
        return response
    })

export type PaymentConfig = Awaited<ReturnType<typeof getPaymentConfig>>
export type PaymentCountryOption = PaymentConfig["countries"][number]
export type PaymentProviderOption = PaymentCountryOption["providers"][number]

// admin/owner only — the platform's real PawaPay wallet balances, combined
// into one total in `currency` when given (converted via a cached FX table)
export const getWalletBalances = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(walletBalancesSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const response = await auth.api.walletBalances({ headers, query: data })
        return response
    })

// admin/owner only — the platform cashing out, not a user-facing action
export const initiatePayout = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(payoutSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { response, headers: responseHeaders } =
            await auth.api.payoutPayment({
                headers,
                returnHeaders: true,
                body: data,
            })
        forwardAuthHeaders(responseHeaders)
        return response
    })

// admin/owner only — reverses a completed deposit
export const initiateRefund = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(refundSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { response, headers: responseHeaders } =
            await auth.api.refundPayment({
                headers,
                returnHeaders: true,
                body: data,
            })
        forwardAuthHeaders(responseHeaders)
        return response
    })
