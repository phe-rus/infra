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
import { settleAll, useAppMutation } from "@/hooks/useAppMutation"
import { queryOptions } from "@tanstack/react-query"
import { withTimeout } from "@/lib/with-timeout"

export const authSettingsQueryOptions = () =>
    queryOptions({
        queryKey: ["authSettings"],
        queryFn: () => withTimeout(getAuthSettings)(),
    })

export const emailPasswordAuthSettingsQueryOptions = () =>
    queryOptions({
        queryKey: ["emailPasswordAuthSettings"],
        queryFn: () => withTimeout(getEmailPasswordAuthSettings)(),
    })

export const securityAuthSettingsQueryOptions = () =>
    queryOptions({
        queryKey: ["securityAuthSettings"],
        queryFn: () => withTimeout(getSecurityAuthSettings)(),
    })

export const trustedOriginsQueryOptions = () =>
    queryOptions({
        queryKey: ["trustedOrigins"],
        queryFn: () => withTimeout(getTrustedOrigins)(),
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
            settleAll([
                () => withTimeout(updateAuthSettings)({ data: data.authMethods }),
                () =>
                    withTimeout(updateEmailPasswordAuthSettings)({
                        data: { requireEmailVerification: data.requireEmailVerification },
                    }),
                () =>
                    withTimeout(updateSecurityAuthSettings)({
                        data: {
                            useSecureCookies: data.useSecureCookies,
                            crossSubDomainCookies: data.crossSubDomainCookies,
                            cookieDomain: data.cookieDomain,
                        },
                    }),
                () => withTimeout(updateTrustedOrigins)({ data: data.trustedOrigins }),
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
