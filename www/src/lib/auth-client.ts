import { createAuthClient } from "better-auth/react"
import { twoFactorClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import { env } from "cloudflare:workers"

export const authClient = createAuthClient({
    baseURL: env.VITE_INFRA_URL,
    plugins: [
        twoFactorClient(),
        passkeyClient(),
        oauthProviderClient()
    ]
})
