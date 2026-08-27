export type EmailScope =
    | "verify-email"
    | "reset-password"
    | "delete-account"

export type ResendOptions = {
    apiKey: string
    from: string
}

export type NotifyOptions = {
    /** True no-op when false (or when `resend` is missing) — matches every other plugin in this repo. */
    enable: boolean
    resend?: ResendOptions
    /** Which of the 3 built-in better-auth email flows to auto-wire. Omit for all three. */
    scope?: EmailScope[]
    /** Used in email subject lines and the "Hi ..., ... from {appName}" copy. */
    appName: string
}

export type EmailUser = { name: string; email: string }

export type SendEmailOptions = {
    to: string
    subject: string
    html: string
}
