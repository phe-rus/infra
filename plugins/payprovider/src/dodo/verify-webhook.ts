import { verifyWebhookPayload } from "@dodopayments/core/webhook"

// WebhookPayload itself isn't exported from @dodopayments/core/webhook,
// only derivable through what verifyWebhookPayload actually resolves to
export type WebhookPayload = Awaited<
    ReturnType<typeof verifyWebhookPayload>
>

// Svix-delivered, HMAC-signed payloads — verifyWebhookPayload throws on a
// bad signature rather than returning a boolean, so this mirrors
// verifyPawaPayCallback's boolean-or-payload shape by catching that here
export async function verifyDodoWebhook(
    webhookSecret: string,
    headers: Record<string, string>,
    body: string
): Promise<WebhookPayload | null> {
    try {
        return await verifyWebhookPayload({
            webhookKey: webhookSecret,
            headers,
            body,
        })
    } catch {
        return null
    }
}
