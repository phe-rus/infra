import { env } from "cloudflare:workers"
import { createAuth, isAdminTier } from "@infra/auth"
import { resources } from "@infra/r2"
import { infraPayment } from "@infra/payment"
import {
    sendDeleteAccountEmail as sendDeleteAccountVerification,
    sendPaymentReceiptEmail as sendPaymentReceipt,
    sendResetPasswordEmail as sendResetPassword,
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
    rateLimit: {
        binding: env.RL,
        paths: ["/pay/*", "/r2/*", "/cdn/**"],
        sharedCounterPrefixes: ["/pay/"],
    },
    emails: {
        sendResetPassword,
        sendVerificationEmail,
        sendDeleteAccountVerification,
    },
    oauth: {
        loginPage: `${env.WWW_URL}/sign-in`,
        consentPage: `${env.WWW_URL}/consent`,
        signUpPage: `${env.WWW_URL}/create-account`,
        scopes: ["openid", "profile", "email", "offline_access", "payments"],
        resources: [env.BETTER_AUTH_URL],
    },
    plugins: [
        resources({
            binding: env.R2,
            isAdmin: isAdminTier,
        }),
        infraPayment({
            apiToken: env.PAWAPAY_API_TOKEN,
            environment:
                env.PAWAPAY_ENV === "production" ? "production" : "sandbox",
            cache: env.PAYMENTS,
            isAdmin: isAdminTier,
            emails: { sendPaymentReceipt },
        }),
    ],
})
