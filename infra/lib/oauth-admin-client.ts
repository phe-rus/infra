import type { BetterAuthClientPlugin } from "better-auth/client"
import type { oauthProvider } from "@better-auth/oauth-provider"

export const oauthAdminClient = () => {
    return {
        id: "oauth-provider-admin",
        $InferServerPlugin: {} as ReturnType<typeof oauthProvider>,
    } satisfies BetterAuthClientPlugin
}
