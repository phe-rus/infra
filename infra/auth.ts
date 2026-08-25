import { env } from "cloudflare:workers"
import { createAuth, isAdminTier } from "@infra/auth"
import { r2Provider } from "@infra/r2"
import { infraPayment, type OAuthAccess } from "@infra/payment"
import * as z from "zod"
import {
    sendDeleteAccountEmail,
    sendPaymentReceiptEmail,
    sendResetPasswordEmail,
    sendVerificationEmail,
} from "./emails"

const oauthUserInfoSchema = z.object({
    id: z.string(),
    scopes: z.array(z.string()),
    clientId: z.string().nullable(),
})

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
            environment:
                env.PAWAPAY_ENV === "production" ? "production" : "sandbox",
            cache: env.PAYMENTS,
            isAdmin: isAdminTier,
            onPaymentCompleted: sendPaymentReceiptEmail,
            resolveOAuthAccess: async (
                headers: Headers
            ): Promise<OAuthAccess | null> => {
                const info = await auth.api
                    .oauth2UserInfo({ headers })
                    .catch(() => null)
                const parsed = oauthUserInfoSchema.safeParse(info)
                if (!parsed.success) return null
                return {
                    userId: parsed.data.id,
                    clientId: parsed.data.clientId,
                    scopes: parsed.data.scopes,
                }
            },
        }),
    ],
})
