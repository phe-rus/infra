import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { authClient } from "@/lib/auth-client"
import { paymentIntentIdSchema } from "./types"

export const fetchMyPayments = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders()
    const { data, error } = await authClient.pay.payments.mine({
        fetchOptions: {
            headers,
        },
    })
    if (error) throw new Error(error.message ?? "Could not load your payments")
    return data
})

export type MyPaymentsData = Awaited<ReturnType<typeof fetchMyPayments>>

export const fetchWallets = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders()
    const { data, error } = await authClient.pay.wallets({
        fetchOptions: {
            headers,
        },
    })
    if (error)
        throw new Error(error.message ?? "Could not load your saved numbers")
    return data
})

export type WalletsData = Awaited<ReturnType<typeof fetchWallets>>

export const fetchPaymentConfig = createServerFn({ method: "GET" }).handler(
    async () => {
        const headers = getRequestHeaders()
        const { data, error } = await authClient.pay.config({
            fetchOptions: {
                headers,
            },
        })
        if (error)
            throw new Error(error.message ?? "Could not load payment providers")
        return data
    }
)

export type PaymentConfigData = Awaited<ReturnType<typeof fetchPaymentConfig>>

export const fetchPaymentIntent = createServerFn({ method: "GET" })
    .validator(paymentIntentIdSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { data: result, error } = await authClient.pay.intent.get({
            query: { id: data.id },
            fetchOptions: { headers },
        })
        if (error) throw new Error(error.message ?? "Could not load this payment")
        return result
    })

export type PaymentIntentData = Awaited<ReturnType<typeof fetchPaymentIntent>>

export const fetchDodoPaymentMethods = createServerFn({ method: "GET" }).handler(
    async () => {
        const headers = getRequestHeaders()
        const { data, error } = await authClient.pay.dodoPaymentMethods({
            fetchOptions: { headers },
        })
        if (error)
            throw new Error(error.message ?? "Could not load your saved cards")
        return data
    }
)

export type DodoPaymentMethodsData = Awaited<
    ReturnType<typeof fetchDodoPaymentMethods>
>

export const fetchDodoBalance = createServerFn({ method: "GET" }).handler(
    async () => {
        const headers = getRequestHeaders()
        const { data, error } = await authClient.pay.dodoBalance({
            fetchOptions: { headers },
        })
        if (error)
            throw new Error(error.message ?? "Could not load your balance")
        return data
    }
)

export type DodoBalanceData = Awaited<ReturnType<typeof fetchDodoBalance>>
