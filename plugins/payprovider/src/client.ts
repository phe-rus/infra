import type { BetterAuthClientPlugin } from "better-auth/client"
import type { infraPayment } from "./index"

// every endpoint here is plain JSON in/out, so $InferServerPlugin alone is
// enough — better-auth's path-based inference gives typed authClient.pay.*
// methods (/pay/config -> pay.config, /pay/deposit -> pay.deposit, etc.).
// paymentWebhook (/pay/webhook) isn't included here — PawaPay's servers hit
// it directly, a browser never calls it.
export const paymentClient = () => {
    return {
        id: "pawapay",
        $InferServerPlugin: {} as ReturnType<typeof infraPayment>,
    } satisfies BetterAuthClientPlugin
}
