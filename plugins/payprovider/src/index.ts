import { schema } from "./schema"
import { PawaPayClient } from "./pawapay/pawapay-client"
import type { PawaPayEnvironment } from "./pawapay/pawapay-client"
import { createDodoClient } from "./dodo/dodo-client"
import type { DodoOptions } from "./dodo/dodo-client"
import { createPawaPayEndpoints } from "./endpoints/pawapay"
import { createDodoEndpoints } from "./endpoints/dodo"
import type { PaymentReceiptInfo } from "./endpoints/pawapay"

export type { PaymentReceiptInfo, OAuthAccess } from "./endpoints/pawapay"

export type PayProviderOptions = {
    /** PawaPay API token — sandbox or production, from their dashboard. */
    apiToken: string
    environment: PawaPayEnvironment
    /** KV binding used to cache PawaPay's country/provider list — avoids re-fetching it on every page load. */
    cache: KVNamespace
    /** Whether a given role has admin-tier access — the caller's own role model, not assumed here. */
    isAdmin: (role: string) => boolean
    emails?: {
        /** Called once, the first time a payment transitions to "completed". Optional: not every self-hoster wants this. */
        sendPaymentReceipt?: (
            email: string,
            receipt: PaymentReceiptInfo
        ) => Promise<void>
    }
    /** Dodo Payments rail — omitted (or leave undefined) to keep it inert, e.g. when DODO_API_KEY isn't configured. */
    dodo?: DodoOptions
}

export function payProvider(options: PayProviderOptions) {
    const { isAdmin, emails, dodo } = options
    const sendPaymentReceipt = emails?.sendPaymentReceipt
    const client = new PawaPayClient(options.apiToken, options.environment)
    const dodoClient = dodo ? createDodoClient(dodo) : null

    return {
        id: "pawapay",
        schema,
        endpoints: {
            ...createPawaPayEndpoints({
                client,
                cache: options.cache,
                isAdmin,
                sendPaymentReceipt,
                dodoEnabled: Boolean(dodoClient),
            }),
            ...createDodoEndpoints({
                dodoClient,
                dodo,
                isAdmin,
                sendPaymentReceipt,
            }),
        },
    }
}
