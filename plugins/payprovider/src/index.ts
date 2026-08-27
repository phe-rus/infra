import { schema } from "./schema"
import { PawaPayClient } from "./pawapay/pawapay-client"
import type { PawaPayEnvironment } from "./pawapay/pawapay-client"
import { createPawaPayEndpoints } from "./endpoints/pawapay"
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
        /** Full override of the receipt's subject/html — skips the built-in template. */
        buildReceipt?: (receipt: PaymentReceiptInfo) => {
            subject: string
            html: string
        }
        /** Actually sends the receipt. Omit to disable receipt emails entirely, even if appName/buildReceipt is set. */
        send?: (data: { to: string; subject: string; html: string }) => Promise<void>
    }
}

function defaultBuildReceipt(appName: string) {
    return (receipt: PaymentReceiptInfo) => ({
        subject: `${appName}: Receipt for ${receipt.amount} ${receipt.currency}`,
        html: paymentReceiptEmailHtml(appName, receipt),
    })
}

export function payProvider(options: PayProviderOptions) {
    const { isAdmin, emails } = options
    const buildReceipt =
        emails?.buildReceipt ??
        (emails?.appName ? defaultBuildReceipt(emails.appName) : undefined)
    const client = new PawaPayClient(options.apiToken, options.environment)

    return {
        id: "pawapay",
        schema,
        endpoints: {
            ...createPawaPayEndpoints({
                client,
                cache: options.cache,
                isAdmin,
                buildReceipt,
                send: emails?.send,
            }),
        },
    }
}
