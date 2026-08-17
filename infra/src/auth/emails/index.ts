import { env } from "cloudflare:workers"
import { sendEmail } from "./client"
import {
    deleteAccountEmailHtml,
    paymentReceiptEmailHtml,
    resetPasswordEmailHtml,
    verificationEmailHtml,
    type PaymentReceiptData,
} from "./templates"

// env.VITE_APPNAME is a lowercase slug ("infra") — capitalized here purely
// for display in email subjects/copy, not touching the env var itself
const appName = env.VITE_APPNAME.charAt(0).toUpperCase() + env.VITE_APPNAME.slice(1)

// matches emailVerification.sendVerificationEmail's exact callback shape
export async function sendVerificationEmail({
    user,
    url,
}: {
    user: { name: string; email: string }
    url: string
}) {
    await sendEmail({
        to: user.email,
        subject: `${appName}: Verify your email`,
        html: verificationEmailHtml(appName, user.name, url),
    })
}

// matches emailAndPassword.sendResetPassword's exact callback shape
export async function sendResetPasswordEmail({
    user,
    url,
}: {
    user: { name: string; email: string }
    url: string
}) {
    await sendEmail({
        to: user.email,
        subject: `${appName}: Reset your password`,
        html: resetPasswordEmailHtml(appName, user.name, url),
    })
}

// matches user.deleteUser.sendDeleteAccountVerification's exact callback shape
export async function sendDeleteAccountEmail({
    user,
    url,
}: {
    user: { name: string; email: string }
    url: string
}) {
    await sendEmail({
        to: user.email,
        subject: `${appName}: Confirm account deletion`,
        html: deleteAccountEmailHtml(appName, user.name, url),
    })
}

// called from the infra-payment plugin's webhook handler when a payment
// transitions to "completed" — not a better-auth callback, this app's own
// shape
export async function sendPaymentReceiptEmail(to: string, receipt: PaymentReceiptData) {
    await sendEmail({
        to,
        subject: `${appName}: Receipt for ${receipt.amount} ${receipt.currency}`,
        html: paymentReceiptEmailHtml(appName, receipt),
    })
}
