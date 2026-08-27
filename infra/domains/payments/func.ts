import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import * as z from "zod"
import { authClient } from "@/lib/auth-client"
import { AdminMiddleware, SessionMiddleware } from "@/middleware"
import {
    listPaymentsSchema,
    payoutSchema,
    refundSchema,
    walletBalancesSchema,
} from "./types"
import type { PaymentRow, UserStub } from "./types"

function headers() {
    return Object.fromEntries(Object.entries(getRequestHeaders()))
}

function toPayment(row: PaymentRow, user?: Pick<UserStub, "name" | "email">) {
    return {
        id: row.id,
        userId: row.userId,
        userName: user?.name ?? null,
        userEmail: user?.email ?? null,
        clientId: row.clientId,
        type: row.type,
        rail: row.rail,
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

export type ListedPayment = ReturnType<typeof toPayment>

export const listPayments = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(listPaymentsSchema)
    .handler(async (): Promise<{ payments: ListedPayment[] }> => {
        throw new Error(
            "listPayments is not yet available: it needs a dedicated api/ endpoint (was raw internalAdapter access, no client equivalent)"
        )
    })

export type PaymentListData = Awaited<ReturnType<typeof listPayments>>

export const findPayment = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(z.object({ paymentId: z.string().min(1) }))
    .handler(
        async (): Promise<{
            payment: ListedPayment
            relatedDeposit: ListedPayment | null
            refunds: ListedPayment[]
        } | null> => {
            throw new Error(
                "findPayment is not yet available: it needs a dedicated api/ endpoint (was raw internalAdapter access, no client equivalent)"
            )
        }
    )

export type PaymentDetail = Awaited<ReturnType<typeof findPayment>>

export const getPaymentConfig = createServerFn({ method: "GET" })
    .middleware([SessionMiddleware])
    .handler(async () => {
        const { data, error } = await authClient.pay.config({
            fetchOptions: { headers: headers() },
        })
        if (error) throw new Error(error.message ?? "Could not load payment config")
        return data
    })

export type PaymentConfig = Awaited<ReturnType<typeof getPaymentConfig>>
export type PaymentCountryOption = NonNullable<PaymentConfig>["countries"][number]
export type PaymentProviderOption = PaymentCountryOption["providers"][number]

export const getWalletBalances = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(walletBalancesSchema)
    .handler(async ({ data }) => {
        const { data: response, error } = await authClient.pay.balances({
            query: data,
            fetchOptions: { headers: headers() },
        })
        if (error) throw new Error(error.message ?? "Could not load wallet balances")
        return response
    })

export const initiatePayout = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(payoutSchema)
    .handler(async ({ data }) => {
        const { data: response, error } = await authClient.pay.payout({
            ...data,
            fetchOptions: { headers: headers() },
        })
        if (error) throw new Error(error.message ?? "Could not initiate payout")
        return response
    })

export const initiateRefund = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(refundSchema)
    .handler(async ({ data }) => {
        const { data: response, error } = await authClient.pay.refund({
            ...data,
            fetchOptions: { headers: headers() },
        })
        if (error) throw new Error(error.message ?? "Could not initiate refund")
        return response
    })
