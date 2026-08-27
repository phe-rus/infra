import type { BetterAuthClientPlugin } from "better-auth/client"
import type { listUserAccounts } from "api"

export const listUserAccountsClient = () => {
    return {
        id: "list-user-accounts",
        $InferServerPlugin: {} as ReturnType<typeof listUserAccounts>,
    } satisfies BetterAuthClientPlugin
}
