import { env } from "cloudflare:workers"
import { auth } from "@/auth"
import {
    verificationEmailHtml,
    resetPasswordEmailHtml,
    deleteAccountEmailHtml,
} from "./templates"

type EmailUser = { name: string; email: string }

export async function send({
    to,
    subject,
    html,
}: {
    to: string
    subject: string
    html: string
}): Promise<void> {
    const response = await fetch(
        "https://api.resend.com/emails",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: env.RESEND_FROM_EMAIL,
                to,
                subject,
                html,
            }),
        }
    )
    if (!response.ok) {
        const error = (await response
            .json()
            .catch(() => null)) as {
            name?: string
            message?: string
        } | null
        throw new Error(
            `Resend send failed: ${error?.name ?? response.status} ${error?.message ?? response.statusText}`
        )
    }
}

export const emailHooks = {
    sendVerificationEmail: async ({
        user,
        url,
    }: {
        user: EmailUser
        url: string
    }) => {
        const { displayName, supportEmail } =
            await auth.api.getInstanceSettings()
        await send({
            to: user.email,
            subject: `${displayName}: Verify your email`,
            html: verificationEmailHtml(
                displayName,
                user.name,
                url,
                supportEmail
            ),
        })
    },
    sendResetPassword: async ({
        user,
        url,
    }: {
        user: EmailUser
        url: string
    }) => {
        const { displayName, supportEmail } =
            await auth.api.getInstanceSettings()
        await send({
            to: user.email,
            subject: `${displayName}: Reset your password`,
            html: resetPasswordEmailHtml(
                displayName,
                user.name,
                url,
                supportEmail
            ),
        })
    },
    sendDeleteAccountVerification: async ({
        user,
        url,
    }: {
        user: EmailUser
        url: string
    }) => {
        const { displayName, supportEmail } =
            await auth.api.getInstanceSettings()
        await send({
            to: user.email,
            subject: `${displayName}: Confirm account deletion`,
            html: deleteAccountEmailHtml(
                displayName,
                user.name,
                url,
                supportEmail
            ),
        })
    },
}
