import type {
    EmailScope,
    EmailUser,
    NotifyOptions,
    SendEmailOptions,
} from "./types"
import {
    deleteAccountEmailHtml,
    resetPasswordEmailHtml,
    verificationEmailHtml,
} from "./templates"

export type EmailHooks = {
    sendVerificationEmail?: (data: {
        user: EmailUser
        url: string
    }) => Promise<void>
    sendResetPassword?: (data: {
        user: EmailUser
        url: string
    }) => Promise<void>
    sendDeleteAccountVerification?: (data: {
        user: EmailUser
        url: string
    }) => Promise<void>
}

const ALL_SCOPES: EmailScope[] = [
    "verify-email",
    "reset-password",
    "delete-account",
]
export function createEmailHooks(
    options: NotifyOptions,
    send: (data: SendEmailOptions) => Promise<void>
): EmailHooks {
    const scope = options.scope ?? ALL_SCOPES
    const { appName } = options

    return {
        sendVerificationEmail: scope.includes("verify-email")
            ? async ({ user, url }) => {
                  await send({
                      to: user.email,
                      subject: `${appName}: Verify your email`,
                      html: verificationEmailHtml(
                          appName,
                          user.name,
                          url
                      ),
                  })
              }
            : undefined,
        sendResetPassword: scope.includes("reset-password")
            ? async ({ user, url }) => {
                  await send({
                      to: user.email,
                      subject: `${appName}: Reset your password`,
                      html: resetPasswordEmailHtml(
                          appName,
                          user.name,
                          url
                      ),
                  })
              }
            : undefined,
        sendDeleteAccountVerification: scope.includes("delete-account")
            ? async ({ user, url }) => {
                  await send({
                      to: user.email,
                      subject: `${appName}: Confirm account deletion`,
                      html: deleteAccountEmailHtml(
                          appName,
                          user.name,
                          url
                      ),
                  })
              }
            : undefined,
    }
}
