import { authClient } from "@/lib/auth-client"
import { useAppMutation } from "./use-app-mutation"
import { walletsOptions } from "./get-payments"

export const useAddWallet = () =>
    useAppMutation({
        mutationFn: async (variables: {
            phoneNumber: string
            provider: string
            label?: string
            makePrimary?: boolean
        }) => {
            const { data, error } = await authClient.pay.wallets.add(variables)
            if (error) throw new Error(error.message ?? "Could not save this number")
            return data
        },
        invalidates: [walletsOptions().queryKey],
        successMessage: "Number saved",
        errorMessage: "Could not save this number",
    })

export const useRemoveWallet = () =>
    useAppMutation({
        mutationFn: async (walletId: string) => {
            const { error } = await authClient.pay.wallets.remove({ walletId })
            if (error) throw new Error(error.message ?? "Could not remove this number")
        },
        invalidates: [walletsOptions().queryKey],
        successMessage: "Number removed",
        errorMessage: "Could not remove this number",
    })

export const useSetPrimaryWallet = () =>
    useAppMutation({
        mutationFn: async (walletId: string) => {
            const { error } = await authClient.pay.wallets.primary({ walletId })
            if (error) throw new Error(error.message ?? "Could not set this as primary")
        },
        invalidates: [walletsOptions().queryKey],
        successMessage: "Primary number updated",
        errorMessage: "Could not set this as primary",
    })

export const useResendReceipt = () =>
    useAppMutation({
        mutationFn: async (paymentId: string) => {
            const { error } = await authClient.pay.receipt.resend({ paymentId })
            if (error) throw new Error(error.message ?? "Could not send this receipt")
        },
        successMessage: "Receipt sent",
        errorMessage: "Could not send this receipt",
    })

// bulk "email selected receipts" — sequential rather than Promise.all so one
// already-pending payment among the selection doesn't abort the rest
export const useResendReceipts = () =>
    useAppMutation({
        mutationFn: async (paymentIds: string[]) => {
            const results = await Promise.allSettled(
                paymentIds.map((paymentId) => authClient.pay.receipt.resend({ paymentId }))
            )
            const failed = results.filter((r) => r.status === "rejected" || r.value.error).length
            if (failed === results.length) throw new Error("Could not send any of the selected receipts")
            return { sent: results.length - failed, failed }
        },
        successMessage: (data) =>
            data.failed > 0 ? `Sent ${data.sent} receipt(s), ${data.failed} failed` : `Sent ${data.sent} receipt(s)`,
        errorMessage: "Could not send the selected receipts",
    })
