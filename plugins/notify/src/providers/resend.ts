import type { ResendOptions, SendEmailOptions } from "../types"

// hand-rolled instead of the `resend` SDK: the SDK's entry point statically
// pulls in postal-mime + standardwebhooks (inbound-email parsing and
// webhook verification) even though this only ever calls the one send
// endpoint — real dead weight in a Cloudflare Workers bundle. This is the
// entire request the SDK would have made anyway: POST /emails, bearer
// auth, JSON body, `{data, error}` response shape.
export function createResendSender(options: ResendOptions) {
    return async function send({
        to,
        subject,
        html,
    }: SendEmailOptions): Promise<void> {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${options.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ from: options.from, to, subject, html }),
        })
        if (!response.ok) {
            const error = (await response.json().catch(() => null)) as {
                name?: string
                message?: string
            } | null
            throw new Error(
                `Resend send failed: ${error?.name ?? response.status} ${error?.message ?? response.statusText}`
            )
        }
    }
}
