import type { BetterAuthClientPlugin } from "better-auth/client"
import type { payProvider } from "./index"

// every endpoint here is plain JSON in/out, so $InferServerPlugin alone is
// enough — better-auth's path-based inference gives typed authClient.pay.*
// methods (/pay/config -> pay.config, /pay/deposit -> pay.deposit, etc.).
// paymentWebhook isn't included here — PawaPay's own servers hit that
// directly, a browser never calls it.
export const paymentClient = () => {
    return {
        id: "pawapay",
        $InferServerPlugin: {} as ReturnType<typeof payProvider>,
    } satisfies BetterAuthClientPlugin
}
