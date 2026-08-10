import {
    authSettingsQueryOptions,
    emailPasswordAuthSettingsQueryOptions,
    securityAuthSettingsQueryOptions,
    trustedOriginsQueryOptions,
    updateAuthSettings,
    updateEmailPasswordAuthSettings,
    updateSecurityAuthSettings,
    updateTrustedOrigins,
} from "@/functions/settingsFn"
import { useMutation } from "@tanstack/react-query"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"

type ProviderSettingsInput = {
    authMethods: Record<string, boolean>
    requireEmailVerification: boolean
    useSecureCookies: boolean
    crossSubDomainCookies: boolean
    cookieDomain: string
    trustedOrigins: string[]
}

export const useUpdateProviderSettings = () => {
    const q = getContext()
    return useMutation({
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
        onSuccess: () => {
            t.success("Settings saved", {
                description: "Changes take effect the next time this instance restarts.",
            })
            q.invalidateQueries(authSettingsQueryOptions())
            q.invalidateQueries(emailPasswordAuthSettingsQueryOptions())
            q.invalidateQueries(securityAuthSettingsQueryOptions())
            q.invalidateQueries(trustedOriginsQueryOptions())
        },
        onError: (error) => {
            t.error("Could not save settings", { description: error.message })
        },
    })
}
