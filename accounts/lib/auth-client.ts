import { createAuthClient } from "better-auth/react"
import {
    twoFactorClient,
    inferAdditionalFields,
} from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import {
    assetsClient,
    withOrigin,
} from "@infra/assets/client"
import { proxiedImageSrc } from "@infra/tanstack-image"

export function hosturl(): string {
    if (import.meta.env.VITE_INFRA_URL) {
        return import.meta.env.VITE_INFRA_URL
    }
    return (
        process.env.VITE_INFRA_URL || "http://localhost:3000"
    )
}

// when the page carries a signed oauth query, the oauth-provider plugin
// answers sign-in/sign-up/2fa with { redirect: true, url } pointing back
// at the client app. follow it, otherwise land on the account home.
export function continueOrGoHome(data: unknown) {
    const result = data as
        | {
              redirect?: boolean
              url?: string
              twoFactorRedirect?: boolean
          }
        | undefined
    if (result?.twoFactorRedirect) return
    window.location.href =
        result?.redirect && result.url ? result.url : "/"
}

export function resolveCdnUrl(
    path?: string | null
): string | undefined {
    if (!path) return undefined
    return proxiedImageSrc(withOrigin(hosturl(), path))
}

export const authClient = createAuthClient({
    baseURL: hosturl(),
    plugins: [
        inferAdditionalFields({
            user: {
                bio: {
                    type: "string",
                    required: false,
                },
                role: {
                    type: "string",
                    required: false,
                },
            },
        }),
        twoFactorClient({
            // carry the signed oauth query along, otherwise verifying
            // the code has nothing to redirect back to the client app
            onTwoFactorRedirect() {
                window.location.href = `/two-factor${window.location.search}`
            },
        }),
        passkeyClient(),
        oauthProviderClient(),
        assetsClient(),
    ],
})
