import { queryOptions } from "@tanstack/react-query"
import {
    fetchDodoBalance,
    fetchDodoPaymentMethods,
    fetchMyPayments,
    fetchPaymentConfig,
    fetchPaymentIntent,
    fetchWallets,
} from "./func"

export const myPaymentsOptions = () =>
    queryOptions({
        queryKey: ["payments", "mine"],
        queryFn: () => fetchMyPayments(),
    })

export const walletsOptions = () =>
    queryOptions({
        queryKey: ["payments", "wallets"],
        queryFn: () => fetchWallets(),
    })

export const paymentConfigOptions = () =>
    queryOptions({
        queryKey: ["payments", "config"],
        queryFn: () => fetchPaymentConfig(),
    })

export const paymentIntentOptions = (intentId: string) =>
    queryOptions({
        queryKey: ["payments", "intent", intentId],
        queryFn: () => fetchPaymentIntent({ data: { id: intentId } }),
    })

export const dodoPaymentMethodsOptions = () =>
    queryOptions({
        queryKey: ["payments", "dodo", "payment-methods"],
        queryFn: () => fetchDodoPaymentMethods(),
    })

export const dodoBalanceOptions = () =>
    queryOptions({
        queryKey: ["payments", "dodo", "balance"],
        queryFn: () => fetchDodoBalance(),
    })
