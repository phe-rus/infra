import { env } from "cloudflare:workers"
import { Resend } from "resend"

export type SendEmailOptions = {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
    const resend = new Resend(env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject,
        html,
    })
    if (error) {
        throw new Error(`Resend send failed: ${error.name} ${error.message}`)
    }
}
