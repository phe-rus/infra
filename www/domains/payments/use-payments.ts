import { useEffect, useState } from "react"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import { useAppMutation } from "@infra/ui/hooks"
import {
    myPaymentsOptions,
    paymentConfigOptions,
    paymentIntentOptions,
    walletsOptions,
} from "./get-payments"

const FAST_POLL_MS = 2000
const SLOW_POLL_MS = 5000
const FAST_POLL_WINDOW_MS = 20_000
const POLL_TIMEOUT_MS = 3 * 60 * 1000

export const useMyPayments = () => useSuspenseQuery(myPaymentsOptions())

export const useWallets = () => useSuspenseQuery(walletsOptions())

export const usePaymentConfig = () =>
    useSuspenseQuery(paymentConfigOptions())

export const useAddWallet = () =>
    useAppMutation({
        mutationFn: async (variables: {
            phoneNumber: string
            provider: string
            label?: string
        }) => {
            const { data, error } =
                await authClient.pay.wallets.add(variables)
            if (error)
                throw new Error(
                    error.message ?? "Could not save this number"
                )
            return data
        },
        invalidates: [walletsOptions().queryKey],
        successMessage: "Number saved",
        errorMessage: "Could not save this number",
    })

export const useRemoveWallet = () =>
    useAppMutation({
        mutationFn: async (walletId: string) => {
            const { error } = await authClient.pay.wallets.remove({
                walletId,
            })
            if (error)
                throw new Error(
                    error.message ?? "Could not remove this number"
                )
        },
        invalidates: [walletsOptions().queryKey],
        successMessage: "Number removed",
        errorMessage: "Could not remove this number",
    })

export const useSetPrimaryWallet = () =>
    useAppMutation({
        mutationFn: async (walletId: string) => {
            const { error } = await authClient.pay.wallets.primary({
                walletId,
            })
            if (error)
                throw new Error(
                    error.message ?? "Could not set this as primary"
                )
        },
        invalidates: [walletsOptions().queryKey],
        successMessage: "Primary number updated",
        errorMessage: "Could not set this as primary",
    })

export const useResendReceipt = () =>
    useAppMutation({
        mutationFn: async (paymentId: string) => {
            const { error } = await authClient.pay.receipt.resend({
                paymentId,
            })
            if (error)
                throw new Error(
                    error.message ?? "Could not send this receipt"
                )
        },
        successMessage: "Receipt sent",
        errorMessage: "Could not send this receipt",
    })

export const useResendReceipts = () =>
    useAppMutation({
        mutationFn: async (paymentIds: string[]) => {
            const results = await Promise.allSettled(
                paymentIds.map((paymentId) =>
                    authClient.pay.receipt.resend({
                        paymentId,
                    })
                )
            )
            const failed = results.filter(
                (r) => r.status === "rejected" || r.value.error
            ).length
            if (failed === results.length)
                throw new Error(
                    "Could not send any of the selected receipts"
                )
            return { sent: results.length - failed, failed }
        },
        successMessage: (data) =>
            data.failed > 0
                ? `Sent ${data.sent} receipt(s), ${data.failed} failed`
                : `Sent ${data.sent} receipt(s)`,
        errorMessage: "Could not send the selected receipts",
    })

export const usePaymentIntent = (intentId: string) => {
    const [pollStartedAt, setPollStartedAt] = useState<number | null>(
        null
    )
    const [timedOut, setTimedOut] = useState(false)

    const { data, refetch } = useQuery({
        ...paymentIntentOptions(intentId),
        refetchInterval: (query) => {
            const status = query.state.data?.intent.status
            if (
                !status ||
                status === "created" ||
                status === "completed" ||
                status === "failed"
            ) {
                return false
            }
            if (timedOut) return false
            const elapsed = Date.now() - (pollStartedAt ?? Date.now())
            return elapsed < FAST_POLL_WINDOW_MS
                ? FAST_POLL_MS
                : SLOW_POLL_MS
        },
    })

    useEffect(() => {
        if (
            data?.intent.status === "pending" &&
            pollStartedAt === null
        ) {
            setPollStartedAt(Date.now())
        }
    }, [data, pollStartedAt])

    useEffect(() => {
        if (pollStartedAt === null || timedOut) return
        const remaining = POLL_TIMEOUT_MS - (Date.now() - pollStartedAt)
        const timer = setTimeout(
            () => setTimedOut(true),
            Math.max(0, remaining)
        )
        return () => clearTimeout(timer)
    }, [pollStartedAt, timedOut])

    useEffect(() => {
        if (!data?.token) return
        const url = new URL(data.intent.returnUrl)
        url.searchParams.set("intent", data.intent.id)
        url.searchParams.set("token", data.token)
        window.location.href = url.toString()
    }, [data])

    const handleCheckAgain = () => {
        setTimedOut(false)
        setPollStartedAt(Date.now())
        void refetch()
    }

    return { data, timedOut, handleCheckAgain }
}

export const useConfirmPaymentIntent = (intentId: string) =>
    useAppMutation({
        mutationFn: async (variables: {
            phoneNumber: string
            provider: string
        }) => {
            if (!variables.provider || !variables.phoneNumber.trim()) {
                throw new Error("Pick a mobile money number")
            }
            const { error } = await authClient.pay.intent.confirm({
                id: intentId,
                phoneNumber: variables.phoneNumber,
                provider: variables.provider,
            })
            if (error)
                throw new Error(
                    error.message ?? "Could not start this payment"
                )
        },
        invalidates: [paymentIntentOptions(intentId).queryKey],
        errorMessage: "Could not start this payment",
    })

