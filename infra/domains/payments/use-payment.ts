import { useAppMutation } from "@infra/ui/hooks"
import { initiatePayout, initiateRefund } from "./fnc"
import { paymentsOptions } from "./get-payment"

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
