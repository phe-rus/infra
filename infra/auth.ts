import { env } from "cloudflare:workers"
import { createAuth, isAdminTier } from "@infra/auth"
import { r2Provider } from "@infra/r2"
import { infraPayment } from "@infra/payment"
import {
    sendDeleteAccountEmail,
    sendPaymentReceiptEmail,
    sendResetPasswordEmail,
    sendVerificationEmail,
} from "./emails"

export const auth = createAuth({
    baseURL: env.BETTER_AUTH_URL,
    appName: env.VITE_APPNAME,
    database: env.AUTH_DB,
    isProduction: env.NODE_ENV === "production",
    cookieDomain: env.COOKIE_DOMAIN,
    trustedOrigins: env.TRUSTED_ORIGINS,
    cache: env.CACHE,
    rateLimitKV: env.RL,
    rateLimitPaths: ["/pay/*", "/r2/*", "/cdn/**"],
    sharedCounterPrefixes: ["/pay/"],
    emails: {
        sendResetPassword: sendResetPasswordEmail,
        sendVerificationEmail: sendVerificationEmail,
        sendDeleteAccountVerification: sendDeleteAccountEmail,
    },
    oauth: {
        loginPage: `${env.WWW_URL}/sign-in`,
        consentPage: `${env.WWW_URL}/consent`,
        signUpPage: `${env.WWW_URL}/create-account`,
        scopes: ["openid", "profile", "email", "offline_access", "payments"],
        resources: [env.BETTER_AUTH_URL],
    },
    plugins: [
        r2Provider({
            binding: env.R2,
            isAdmin: isAdminTier,
        }),
        infraPayment({
            apiToken: env.PAWAPAY_API_TOKEN,
            environment: env.PAWAPAY_ENV === "production" ? "production" : "sandbox",
            cache: env.PAYMENTS,
            isAdmin: isAdminTier,
            onPaymentCompleted: sendPaymentReceiptEmail,
            resolveOAuthAccess: async (
                headers: Headers
            ): Promise<{ userId: string; clientId: string | null; scopes: string[] } | null> => {
                const info: Record<string, unknown> | null = await auth.api
                    .oauth2UserInfo({ headers })
                    .catch(() => null)
                if (!info || !Array.isArray(info.scopes)) return null
                const userId = typeof info.id === "string" ? info.id : undefined
                if (!userId) return null
                return {
                    userId,
                    clientId: typeof info.clientId === "string" ? info.clientId : null,
                    scopes: info.scopes as string[],
                }
            },
        }),
    ],
})
