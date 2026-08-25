import type { BetterAuthOptions } from "better-auth/types"
import { password } from "./password"

type EmailAndPassword = NonNullable<BetterAuthOptions["emailAndPassword"]>
type EmailVerification = NonNullable<BetterAuthOptions["emailVerification"]>
type UserOptions = NonNullable<BetterAuthOptions["user"]>
type AdditionalFields = NonNullable<UserOptions["additionalFields"]>

export type SessionEmailCallbacks = {
    sendResetPassword: EmailAndPassword["sendResetPassword"]
    sendVerificationEmail: EmailVerification["sendVerificationEmail"]
    sendDeleteAccountVerification: NonNullable<
        UserOptions["deleteUser"]
    >["sendDeleteAccountVerification"]
}

// extra columns an app needs on top of "bio" — kept optional so most callers
// never have to think about it, in case a future app needs its own fields
export function createSessionOptions(
    emails: SessionEmailCallbacks,
    additionalFields?: AdditionalFields
) {
    return {
        emailAndPassword: {
            enabled: true,
            revokeSessionsOnPasswordReset: true,
            resetPasswordTokenExpiresIn: 3600, // 1 hour
            password,
            autoSignIn: true,
            maxPasswordLength: 48,
            minPasswordLength: 8,
            requireEmailVerification: true,
            sendResetPassword: emails.sendResetPassword,
        },
        emailVerification: {
            autoSignInAfterVerification: true,
            sendOnSignIn: true,
            sendVerificationEmail: emails.sendVerificationEmail,
        },
        account: {
            accountLinking: {
                enabled: true,
                trustedProviders: ["email-password"],
                allowDifferentEmails: false,
            },
        },
        user: {
            additionalFields: {
                bio: { type: "string", required: false },
                ...additionalFields,
            },
            deleteUser: {
                enabled: true,
                sendDeleteAccountVerification:
                    emails.sendDeleteAccountVerification,
            },
        },
        session: {
            expiresIn: 60 * 60 * 24 * 30, // 30 days
            updateAge: 60 * 60 * 24, // refresh if older than 24 h
            storeSessionInDatabase: true,
            cookieCache: {
                enabled: true,
                maxAge: 60 * 60 * 4, // 4-hour browser-side cache
            },
        },
    } satisfies Partial<BetterAuthOptions>
}
