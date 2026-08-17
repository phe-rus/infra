import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

// a naked authClient.pay.*() call has no cookies to attach during SSR (the
// server has no browser cookie jar to draw from) — these forward the
// incoming request's own headers, same pattern as get-auth.ts's currentUser
const fetchMyPayments = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders()
    const { data, error } = await authClient.pay.payments.mine({ fetchOptions: { headers } })
    if (error) throw new Error(error.message ?? "Could not load your payments")
    return data
})

export const myPaymentsOptions = () => queryOptions({
    queryKey: ["payments", "mine"],
    queryFn: () => fetchMyPayments(),
})

export const useMyPayments = () => useSuspenseQuery(myPaymentsOptions())

const fetchWallets = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders()
    const { data, error } = await authClient.pay.wallets({ fetchOptions: { headers } })
    if (error) throw new Error(error.message ?? "Could not load your saved numbers")
    return data
})

export const walletsOptions = () => queryOptions({
    queryKey: ["payments", "wallets"],
    queryFn: () => fetchWallets(),
})

export const useWallets = () => useSuspenseQuery(walletsOptions())

const fetchPaymentConfig = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders()
    const { data, error } = await authClient.pay.config({ fetchOptions: { headers } })
    if (error) throw new Error(error.message ?? "Could not load payment providers")
    return data
})

export const paymentConfigOptions = () => queryOptions({
    queryKey: ["payments", "config"],
    queryFn: () => fetchPaymentConfig(),
})

export const usePaymentConfig = () => useSuspenseQuery(paymentConfigOptions())
