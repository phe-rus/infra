import { env } from "../../utils/envs"
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
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: env.RESEND_FROM_EMAIL, to, subject, html }),
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

export const emailHooks = {
    sendVerificationEmail: async ({
        user,
        url,
    }: {
        user: EmailUser
        url: string
    }) => {
        await send({
            to: user.email,
            subject: `${env.VITE_APPNAME}: Verify your email`,
            html: verificationEmailHtml(env.VITE_APPNAME, user.name, url),
        })
    },
    sendResetPassword: async ({
        user,
        url,
    }: {
        user: EmailUser
        url: string
    }) => {
        await send({
            to: user.email,
            subject: `${env.VITE_APPNAME}: Reset your password`,
            html: resetPasswordEmailHtml(env.VITE_APPNAME, user.name, url),
        })
    },
    sendDeleteAccountVerification: async ({
        user,
        url,
    }: {
        user: EmailUser
        url: string
    }) => {
        await send({
            to: user.email,
            subject: `${env.VITE_APPNAME}: Confirm account deletion`,
            html: deleteAccountEmailHtml(env.VITE_APPNAME, user.name, url),
        })
    },
}
