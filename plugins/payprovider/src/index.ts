import { schema } from "./schema"
import { PawaPayClient } from "./pawapay/pawapay-client"
import type { PawaPayEnvironment } from "./pawapay/pawapay-client"
import { createDodoClient } from "./dodo/dodo-client"
import type { DodoOptions } from "./dodo/dodo-client"
import { createPawaPayEndpoints } from "./endpoints/pawapay"
import { createDodoEndpoints } from "./endpoints/dodo"
import type { PaymentReceiptInfo } from "./endpoints/pawapay"
import { paymentReceiptEmailHtml } from "./receipt-template"

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
        /** Used for the built-in receipt template's branding/subject line ("{appName}: Receipt for ..."). Ignored if `buildReceipt` is set. Omit both to disable receipt emails entirely. */
        appName?: string
        /** Full override of the receipt's subject/html — skips the built-in template. Pure, synchronous, no knowledge of how it actually gets sent: the plugin looks up a plugin with id "notify" on the same better-auth instance at request time (via ctx.context.getPlugin) to actually send it; if none is registered, receipts are silently skipped even if this is set. */
        buildReceipt?: (receipt: PaymentReceiptInfo) => {
            subject: string
            html: string
        }
    }
    /** Dodo Payments rail — omitted (or leave undefined) to keep it inert, e.g. when DODO_API_KEY isn't configured. */
    dodo?: DodoOptions
}

function defaultBuildReceipt(appName: string) {
    return (receipt: PaymentReceiptInfo) => ({
        subject: `${appName}: Receipt for ${receipt.amount} ${receipt.currency}`,
        html: paymentReceiptEmailHtml(appName, receipt),
    })
}

export function payProvider(options: PayProviderOptions) {
    const { isAdmin, emails, dodo } = options
    const buildReceipt =
        emails?.buildReceipt ??
        (emails?.appName ? defaultBuildReceipt(emails.appName) : undefined)
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
                buildReceipt,
                dodoEnabled: Boolean(dodoClient),
            }),
            ...createDodoEndpoints({
                dodoClient,
                dodo,
                isAdmin,
                buildReceipt,
            }),
        },
    }
}
