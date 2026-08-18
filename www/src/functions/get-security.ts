import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { queryOptions } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import { useAppMutation } from "@infra/ui/hooks/use-app-mutation"
import { currentOptions } from "./get-auth"

const fetchPasskeys = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders()
    const { data, error } = await authClient.passkey.listUserPasskeys({
        fetchOptions: { headers },
    })
    if (error) throw new Error(error.message ?? "Could not load your passkeys")
    return data
})

export const passkeysOptions = () =>
    queryOptions({
        queryKey: ["passkeys"],
        queryFn: () => fetchPasskeys(),
    })

export const useEnableTwoFactor = () =>
    useAppMutation({
        mutationFn: async (password: string) => {
            const { data, error } = await authClient.twoFactor.enable({
                password,
            })
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
            if (error)
                throw new Error(error.message ?? "Could not disable two-factor authentication")
        },
        invalidates: [currentOptions().queryKey],
        successMessage: "Two-factor authentication disabled",
        errorMessage: "Could not disable two-factor authentication",
    })

export const useGenerateBackupCodes = () =>
    useAppMutation({
        mutationFn: async (password: string) => {
            const { data, error } = await authClient.twoFactor.generateBackupCodes({ password })
            if (error) throw new Error(error.message ?? "Could not generate backup codes")
            return data
        },
        successMessage: "New backup codes generated",
        errorMessage: "Could not generate backup codes",
    })

export const useAddPasskey = () =>
    useAppMutation({
        mutationFn: async ({
            name,
            authenticatorAttachment,
        }: {
            name: string
            authenticatorAttachment?: "platform" | "cross-platform"
        }) => {
            const { error } = await authClient.passkey.addPasskey({
                name,
                authenticatorAttachment,
            })
            if (error) {
                // the server excludes every credential this account already has when
                // starting registration, so the *same* platform authenticator (Touch
                // ID, Windows Hello, a synced password manager) refuses to create a
                // second one for it — not a bug, WebAuthn's own duplicate guard. A
                // genuinely additional passkey needs a different device/security key.
                if ("code" in error && error.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") {
                    throw new Error(
                        'This device already has a passkey for your account. To add another, choose "a different device or security key".'
                    )
                }
                throw new Error(error.message ?? "Could not add passkey")
            }
        },
        invalidates: [passkeysOptions().queryKey],
        successMessage: "Passkey added",
        errorMessage: "Could not add passkey",
    })

export const useUpdatePasskey = () =>
    useAppMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            const { error } = await authClient.passkey.updatePasskey({ id, name })
            if (error) throw new Error(error.message ?? "Could not rename passkey")
        },
        invalidates: [passkeysOptions().queryKey],
        successMessage: "Passkey renamed",
        errorMessage: "Could not rename passkey",
    })

export const useDeletePasskey = () =>
    useAppMutation({
        mutationFn: async (id: string) => {
            const { error } = await authClient.passkey.deletePasskey({
                id,
            })
            if (error) throw new Error(error.message ?? "Could not remove passkey")
        },
        invalidates: [passkeysOptions().queryKey],
        successMessage: "Passkey removed",
        errorMessage: "Could not remove passkey",
    })
