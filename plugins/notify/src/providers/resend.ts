import { Resend } from "resend"
import type { ResendOptions, SendEmailOptions } from "../types"

export function createResendSender(options: ResendOptions) {
    return async function send({
        to,
        subject,
        html,
    }: SendEmailOptions): Promise<void> {
        const resend = new Resend(options.apiKey)
        const { error } = await resend.emails.send({
            from: options.from,
            to,
            subject,
            html,
        })
        if (error) {
            throw new Error(
                `Resend send failed: ${error.name} ${error.message}`
            )
        }
    }
}
