import { queryOptions } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import { useAppMutation } from "./use-app-mutation"
import { currentOptions } from "./get-auth"

export const passkeysOptions = () => queryOptions({
    queryKey: ["passkeys"],
    queryFn: async () => {
        const { data } = await authClient.passkey.listUserPasskeys()
        return data
    }
})

export const useEnableTwoFactor = () =>
    useAppMutation({
        mutationFn: async (password: string) => {
            const { data, error } = await authClient.twoFactor.enable({ password })
            if (error) throw new Error(error.message ?? "Could not start two-factor setup")
            return data
        },
        errorMessage: "Could not start two-factor setup",
    })

export const useVerifyTwoFactor = () =>
    useAppMutation({
        mutationFn: async (code: string) => {
            const { error } = await authClient.twoFactor.verifyTotp({ code })
            if (error) throw new Error(error.message ?? "Invalid code")
        },
        invalidates: [currentOptions().queryKey],
        successMessage: "Two-factor authentication enabled",
        errorMessage: "Invalid code",
    })

export const useDisableTwoFactor = () =>
    useAppMutation({
        mutationFn: async (password: string) => {
            const { error } = await authClient.twoFactor.disable({ password })
            if (error) throw new Error(error.message ?? "Could not disable two-factor authentication")
        },
        invalidates: [currentOptions().queryKey],
        successMessage: "Two-factor authentication disabled",
        errorMessage: "Could not disable two-factor authentication",
    })

export const useAddPasskey = () =>
    useAppMutation({
        mutationFn: async (name: string) => {
            const { error } = await authClient.passkey.addPasskey({ name })
            if (error) throw new Error(error.message ?? "Could not add passkey")
        },
        invalidates: [passkeysOptions().queryKey],
        successMessage: "Passkey added",
        errorMessage: "Could not add passkey",
    })

export const useDeletePasskey = () =>
    useAppMutation({
        mutationFn: async (id: string) => {
            const { error } = await authClient.passkey.deletePasskey({ id })
            if (error) throw new Error(error.message ?? "Could not remove passkey")
        },
        invalidates: [passkeysOptions().queryKey],
        successMessage: "Passkey removed",
        errorMessage: "Could not remove passkey",
    })
