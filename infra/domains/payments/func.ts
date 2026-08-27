import type * as z from "zod"
import { authClient } from "@/lib/auth-client"
import { rpc } from "@/lib/rpc-client"
import type {
    listPaymentsSchema,
    payoutSchema,
    refundSchema,
    walletBalancesSchema,
} from "./types"

export async function listPayments(
    filters: z.infer<typeof listPaymentsSchema>
) {
    const res = await rpc.api.payments.list.$get({
        query: {
            ...(filters.userId && { userId: filters.userId }),
            ...(filters.type && { type: filters.type }),
            ...(filters.status && { status: filters.status }),
        },
    })
    if (!res.ok) throw new Error("Could not list payments")
    return await res.json()
}

export type PaymentListData = Awaited<ReturnType<typeof listPayments>>
export type ListedPayment = PaymentListData["payments"][number]

export async function findPayment(paymentId: string) {
    const res = await rpc.api.payments[":paymentId"].$get({
        param: { paymentId },
    })
    if (!res.ok) throw new Error("Could not load payment")
    return await res.json()
}

export type PaymentDetail = Awaited<ReturnType<typeof findPayment>>

export async function getPaymentConfig() {
    const { data, error } = await authClient.pay.config()
    if (error) {
        throw new Error(error.message ?? "Could not load payment config")
    }
    return data
}

export type PaymentConfig = Awaited<ReturnType<typeof getPaymentConfig>>
export type PaymentCountryOption =
    NonNullable<PaymentConfig>["countries"][number]
export type PaymentProviderOption = PaymentCountryOption["providers"][number]

export async function getWalletBalances(
    query: z.infer<typeof walletBalancesSchema>
) {
    const { data, error } = await authClient.pay.balances({ query })
    if (error) {
        throw new Error(error.message ?? "Could not load wallet balances")
    }
    return data
}

export async function initiatePayout(input: z.infer<typeof payoutSchema>) {
    const { data, error } = await authClient.pay.payout(input)
    if (error) throw new Error(error.message ?? "Could not initiate payout")
    return data
}

export async function initiateRefund(input: z.infer<typeof refundSchema>) {
    const { data, error } = await authClient.pay.refund(input)
    if (error) throw new Error(error.message ?? "Could not initiate refund")
    return data
}
