import { createAuthClient } from "better-auth/react"
import {
    adminClient,
    twoFactorClient,
    inferAdditionalFields,
} from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import { withOrigin } from "@infra/r2/client"
import { paymentClient } from "@infra/payprovider/client"
import { proxiedImageSrc } from "@infra/tanstack-image"
import { listUserAccountsClient } from "./admin-accounts-client"
import { oauthAdminClient } from "./oauth-admin-client"

export function apiUrl(): string {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL
    }
    return process.env.VITE_API_URL || "http://localhost:3000"
}

export function resolveCdnUrl(path?: string | null): string | undefined {
    if (!path) return undefined
    return proxiedImageSrc(withOrigin(apiUrl(), path))
}

export const authClient = createAuthClient({
    baseURL: 'http://localhost:3000',
    plugins: [
        inferAdditionalFields({
            user: {
                bio: {
                    type: "string",
                    required: false,
                }
            },
        }),
        adminClient(),
        listUserAccountsClient(),
        oauthAdminClient(),
        twoFactorClient({
            twoFactorPage: "/two-factor",
        }),
        passkeyClient(),
        oauthProviderClient(),
        paymentClient(),
    ],
})
