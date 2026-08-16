import { useAppMutation } from "@/kit/shared"
import { initiateDeposit, initiatePayout, initiateRefund } from "./fnc"
import { myPaymentsOptions, paymentsOptions } from "./get-payment"

export const useInitiateDeposit = () =>
    useAppMutation({
        mutationFn: initiateDeposit,
        invalidates: [myPaymentsOptions().queryKey],
        successMessage: "Deposit initiated",
        successDescription: "You'll get a mobile money prompt on your phone shortly",
        errorMessage: "Could not initiate deposit",
    })

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
