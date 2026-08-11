import {
    getAuthSettings,
    getEmailPasswordAuthSettings,
    getSecurityAuthSettings,
    getTrustedOrigins,
    updateAuthSettings,
    updateEmailPasswordAuthSettings,
    updateSecurityAuthSettings,
    updateTrustedOrigins,
} from "@/functions/settingsFn"
import { useAppMutation } from "@/hooks/useAppMutation"
import { queryOptions } from "@tanstack/react-query"

export const authSettingsQueryOptions = () =>
    queryOptions({
        queryKey: ["authSettings"],
        queryFn: () => getAuthSettings(),
    })

export const emailPasswordAuthSettingsQueryOptions = () =>
    queryOptions({
        queryKey: ["emailPasswordAuthSettings"],
        queryFn: () => getEmailPasswordAuthSettings(),
    })

export const securityAuthSettingsQueryOptions = () =>
    queryOptions({
        queryKey: ["securityAuthSettings"],
        queryFn: () => getSecurityAuthSettings(),
    })

export const trustedOriginsQueryOptions = () =>
    queryOptions({
        queryKey: ["trustedOrigins"],
        queryFn: () => getTrustedOrigins(),
    })

type ProviderSettingsInput = {
    authMethods: Record<string, boolean>
    requireEmailVerification: boolean
    useSecureCookies: boolean
    crossSubDomainCookies: boolean
    cookieDomain: string
    trustedOrigins: string[]
}

export const useUpdateProviderSettings = () =>
    useAppMutation({
        mutationFn: (data: ProviderSettingsInput) =>
            Promise.all([
                updateAuthSettings({ data: data.authMethods }),
                updateEmailPasswordAuthSettings({
                    data: { requireEmailVerification: data.requireEmailVerification },
                }),
                updateSecurityAuthSettings({
                    data: {
                        useSecureCookies: data.useSecureCookies,
                        crossSubDomainCookies: data.crossSubDomainCookies,
                        cookieDomain: data.cookieDomain,
                    },
                }),
                updateTrustedOrigins({ data: data.trustedOrigins }),
            ]),
        invalidates: [
            authSettingsQueryOptions().queryKey,
            emailPasswordAuthSettingsQueryOptions().queryKey,
            securityAuthSettingsQueryOptions().queryKey,
            trustedOriginsQueryOptions().queryKey,
        ],
        successMessage: "Settings saved",
        successDescription: "Changes take effect the next time this instance restarts.",
        errorMessage: "Could not save settings",
    })
