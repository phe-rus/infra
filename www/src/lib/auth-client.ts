import { createAuthClient } from "better-auth/react"
import { twoFactorClient, inferAdditionalFields } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import { r2Client } from "@infra/r2/client"
import { paymentClient } from "@infra/payment/client"


function hosturl(): string {
    if (import.meta.env.VITE_INFRA_URL) {
        return import.meta.env.VITE_INFRA_URL
    }
    return process.env.VITE_INFRA_URL || 'http://100.115.92.26:3000'
}

export const authClient = createAuthClient({
    baseURL: hosturl(),
    plugins: [
        inferAdditionalFields({
            user: {
                bio: {
                    type: "string",
                    required: false
                },
                role: {
                    type: "string",
                    required: false
                }
            }
        }),
        twoFactorClient({
            twoFactorPage: "/two-factor"
        }),
        passkeyClient(),
        oauthProviderClient(),
        r2Client(),
        paymentClient()
    ]
})
