import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import type * as z from "zod"
import { useAppMutation } from "@infra/ui/hooks"
import { initiatePayout, initiateRefund } from "./func"
import {
    dodoMerchantBalanceOptions,
    paymentConfigOptions,
    paymentOptions,
    paymentsOptions,
    walletBalancesOptions,
} from "./get-payments"
import type { listPaymentsSchema, walletBalancesSchema } from "./types"

export const usePayments = (filters?: z.infer<typeof listPaymentsSchema>) =>
    useSuspenseQuery(paymentsOptions(filters))

export const usePaymentConfig = () => useSuspenseQuery(paymentConfigOptions())

export const useWalletBalances = (
    filters?: z.infer<typeof walletBalancesSchema>
) => useSuspenseQuery(walletBalancesOptions(filters))

// not suspense: dodo may not be configured on this instance at all, and
// that shouldn't take down a dashboard that also shows pawapay's balance
export const useDodoMerchantBalance = () =>
    useQuery(dodoMerchantBalanceOptions())

export const usePayment = (paymentId: string) =>
    useSuspenseQuery(paymentOptions(paymentId))

export const useInitiatePayout = () =>
    useAppMutation({
        mutationFn: initiatePayout,
        invalidates: [paymentsOptions().queryKey],
        successMessage: "Payout initiated",
        errorMessage: "Could not initiate payout",
    })

export const useInitiateRefund = () =>
    useAppMutation({
        mutationFn: initiateRefund,
        invalidates: [paymentsOptions().queryKey],
        successMessage: "Refund initiated",
        errorMessage: "Could not initiate refund",
    })
