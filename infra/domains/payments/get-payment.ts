import { keepPreviousData, queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import type * as z from "zod"
import { findPayment, getPaymentConfig, getWalletBalances, listPayments } from "./fnc"
import type { listPaymentsSchema, walletBalancesSchema } from "./schema"

export const paymentsOptions = (filters: z.infer<typeof listPaymentsSchema> = {}) =>
    queryOptions({
        queryKey: ["payments", filters],
        queryFn: () => listPayments({ data: filters }),
    })

export const usePayments = (filters?: z.infer<typeof listPaymentsSchema>) =>
    useSuspenseQuery(paymentsOptions(filters))

export const paymentConfigOptions = () =>
    queryOptions({
        queryKey: ["payments", "config"],
        queryFn: () => getPaymentConfig(),
    })

export const usePaymentConfig = () => useSuspenseQuery(paymentConfigOptions())

export const walletBalancesOptions = (filters: z.infer<typeof walletBalancesSchema> = {}) =>
    queryOptions({
        queryKey: ["payments", "balances", filters],
        queryFn: () => getWalletBalances({ data: filters }),
        // switching the preferred currency changes the query key — keep
        // showing the last total instead of suspending the whole section
        // while the new one loads
        placeholderData: keepPreviousData,
    })

export const useWalletBalances = (filters?: z.infer<typeof walletBalancesSchema>) =>
    useSuspenseQuery(walletBalancesOptions(filters))

export const paymentOptions = (paymentId: string) =>
    queryOptions({
        queryKey: ["payments", "detail", paymentId],
        queryFn: () => findPayment({ data: { paymentId } }),
    })

export const usePayment = (paymentId: string) => useSuspenseQuery(paymentOptions(paymentId))
