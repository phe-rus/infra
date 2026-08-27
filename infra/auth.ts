import { env } from "cloudflare:workers"
import { createAuth, isAdminTier } from "@infra/auth"
import { resources } from "../plugins/resources/src"
import { payProvider } from "@infra/payprovider"
import { notify } from "@infra/notify"

const appName =
    env.VITE_APPNAME.charAt(0).toUpperCase() + env.VITE_APPNAME.slice(1)

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
    email: { enable: true },
    oauth: {
        loginPage: `${env.WWW_URL}/sign-in`,
        consentPage: `${env.WWW_URL}/consent`,
        signUpPage: `${env.WWW_URL}/create-account`,
        scopes: [
            "openid",
            "profile",
            "email",
            "offline_access",
            "payments",
        ],
        resources: [env.BETTER_AUTH_URL],
    },
    plugins: [
        notify({
            enable: true,
            appName: appName,
            resend: {
                apiKey: env.RESEND_API_KEY,
                from: env.RESEND_FROM_EMAIL,
            },
        }),
        resources({
            binding: env.R2,
            isAdmin: isAdminTier,
        }),
        payProvider({
            apiToken: env.PAWAPAY_API_TOKEN,
            environment:
                env.PAWAPAY_ENV === "production"
                    ? "production"
                    : "sandbox",
            cache: env.PAYMENTS,
            isAdmin: isAdminTier,
            emails: { appName },
            dodo: env.DODO_API_KEY
                ? {
                      apiKey: env.DODO_API_KEY,
                      webhookSecret: env.DODO_WEBHOOK_SECRET,
                      checkoutId: env.DODO_CHECKOUT_ID,
                      creditEntitlementId:
                          env.DODO_CREDIT_ENTITLEMENT_ID || undefined,
                      environment:
                          env.NODE_ENV === "production"
                              ? "live_mode"
                              : "test_mode",
                  }
                : undefined,
        }),
    ],
})
