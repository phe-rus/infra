import { createAuthClient } from "better-auth/react"
import { twoFactorClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import { r2Client } from "@infra/r2/client"
import { paymentClient } from "@infra/payment/client"


function hosturl(): string {
    if (typeof window !== "undefined") {
        return process.env.VITE_INFRA_URL
    }
    if (import.meta.env.VITE_INFRA_URL) {
        return import.meta.env.VITE_INFRA_URL
    }
    return process.env.VITE_INFRA_URL || 'http://localhost:3000'
}

export const authClient = createAuthClient({
    baseURL: hosturl(),
    plugins: [
        twoFactorClient({
            twoFactorPage: "/two-factor"
        }),
        passkeyClient(),
        oauthProviderClient(),
        r2Client(),
        paymentClient()
    ]
})
