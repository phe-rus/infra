import type { ResendOptions, SendEmailOptions } from "../types"

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
