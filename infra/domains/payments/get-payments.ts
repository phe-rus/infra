import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import type * as z from "zod"
import {
    findPayment,
    getDodoMerchantBalance,
    getPaymentConfig,
    getWalletBalances,
    listPayments,
} from "./func"
import type { listPaymentsSchema, walletBalancesSchema } from "./types"

export const paymentsOptions = (
    filters: z.infer<typeof listPaymentsSchema> = {}
) =>
    queryOptions({
        queryKey: ["payments", filters],
        queryFn: () => listPayments({ data: filters }),
    })

export const paymentConfigOptions = () =>
    queryOptions({
        queryKey: ["payments", "config"],
        queryFn: () => getPaymentConfig(),
    })

export const walletBalancesOptions = (
    filters: z.infer<typeof walletBalancesSchema> = {}
) =>
    queryOptions({
        queryKey: ["payments", "balances", filters],
        queryFn: () => getWalletBalances({ data: filters }),
        placeholderData: keepPreviousData,
    })

export const dodoMerchantBalanceOptions = () =>
    queryOptions({
        queryKey: ["payments", "dodo-merchant-balance"],
        queryFn: () => getDodoMerchantBalance(),
    })

export const paymentOptions = (paymentId: string) =>
    queryOptions({
        queryKey: ["payments", "detail", paymentId],
        queryFn: () => findPayment({ data: { paymentId } }),
    })
