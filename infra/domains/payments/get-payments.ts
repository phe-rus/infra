import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import type * as z from "zod"
import {
    findPayment,
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
        queryFn: () => listPayments(filters),
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
        queryFn: () => getWalletBalances(filters),
        placeholderData: keepPreviousData,
    })

export const paymentOptions = (paymentId: string) =>
    queryOptions({
        queryKey: ["payments", "detail", paymentId],
        queryFn: () => findPayment(paymentId),
    })
