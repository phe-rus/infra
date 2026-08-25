import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

const fetchMyPayments = createServerFn({ method: "GET" }).handler(async () => {
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

const fetchWallets = createServerFn({ method: "GET" }).handler(async () => {
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

const fetchPaymentConfig = createServerFn({ method: "GET" }).handler(
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

export const myPaymentsOptions = () =>
    queryOptions({
        queryKey: ["payments", "mine"],
        queryFn: () => fetchMyPayments(),
    })

export const useMyPayments = () => useSuspenseQuery(myPaymentsOptions())

export const walletsOptions = () =>
    queryOptions({
        queryKey: ["payments", "wallets"],
        queryFn: () => fetchWallets(),
    })

export const useWallets = () => useSuspenseQuery(walletsOptions())

export const paymentConfigOptions = () =>
    queryOptions({
        queryKey: ["payments", "config"],
        queryFn: () => fetchPaymentConfig(),
    })

export const usePaymentConfig = () => useSuspenseQuery(paymentConfigOptions())
