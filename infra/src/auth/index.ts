import { tanstackStartCookies } from "better-auth/tanstack-start"
import { oauthProvider } from "@better-auth/oauth-provider"
import { passkey } from "@better-auth/passkey"
import { ac, buildRoles, isAdminTier } from "./utils/permissions"
import { password } from "./utils/password"
import {
    sendDeleteAccountEmail,
    sendPaymentReceiptEmail,
    sendResetPasswordEmail,
    sendVerificationEmail,
} from "./emails"
import { env } from "cloudflare:workers"
import { betterAuth } from "better-auth"
import { secondaryStorage, trustedOrigins, databaseHooks } from "./configs"
import { advanced } from "./advanced"
import { r2Provider } from "@infra/r2"
import { infraPayment } from "@infra/payment"
import { admin, jwt, openAPI, twoFactor } from "better-auth/plugins"

const roles = buildRoles()

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    appName: env.VITE_APPNAME,
    database: env.AUTH_DB,
    experimental: { joins: true },
    trustedOrigins: trustedOrigins,
    disabledPaths: ["/token"],
    emailAndPassword: {
        enabled: true,
        revokeSessionsOnPasswordReset: true,
        resetPasswordTokenExpiresIn: 3600, // 1 hour
        password: password,
        autoSignIn: true,
        maxPasswordLength: 48,
        minPasswordLength: 8,
        requireEmailVerification: true,
        sendResetPassword: sendResetPasswordEmail,
    },
    emailVerification: {
        autoSignInAfterVerification: true,
        sendOnSignIn: true,
        sendVerificationEmail: sendVerificationEmail,
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
            bio: {
                type: "string",
                required: false,
            },
        },
        deleteUser: {
            enabled: true,
            sendDeleteAccountVerification: sendDeleteAccountEmail,
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24, // refresh if older than 24 h
        storeSessionInDatabase: true,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 30, // 30-min browser-side cache
        },
    },
    rateLimit: {
        enabled: true,
        window: 60,
        max: 100,
        storage: "secondary-storage",
        customRules: {
            "/pay/*": { window: 60, max: 100 },
            "/r2/*": { window: 60, max: 100 },
            "/cdn/**": { window: 60, max: 100 },
        },
        customStorage: {
            get: async (key) => {
                const value = await env.RL.get(key)
                if (!value) return null

                const data = JSON.parse(value)
                if (data && typeof data === "object") {
                    data.key = key
                }
                return data
            },
            set: async (key, value, ttl) => {
                if (typeof value === "object") {
                    value.key = key
                }

                const stringValue = JSON.stringify(value)
                const expirationTtl = typeof ttl === "number" ? Math.max(ttl, 60) : 60
                await env.RL.put(key, stringValue, { expirationTtl })
            },
            consume: async (key, rule) => {
                const now = Math.floor(Date.now() / 1000)
                const value = await env.RL.get(key)

                let data = value
                    ? (JSON.parse(value) as { key?: string; count: number; lastRequest: number })
                    : null

                if (!data || now - data.lastRequest > rule.window) {
                    data = { key, count: 0, lastRequest: now }
                }

                if (data.count >= rule.max) {
                    const retryAfter = Math.max(0, data.lastRequest + rule.window - now)
                    return {
                        allowed: false,
                        retryAfter: retryAfter || 1,
                    }
                }

                data.count += 1
                data.key = key

                const kvTtl = Math.max(rule.window, 60)
                await env.RL.put(key, JSON.stringify(data), {
                    expirationTtl: kvTtl,
                })

                return {
                    allowed: true,
                    retryAfter: null,
                }
            },
        },
    },
    secondaryStorage: secondaryStorage,
    databaseHooks: databaseHooks,
    advanced: advanced,
    logger: {
        disabled: false,
        disableColors: false,
        level: "warn",
        log: (level, message, ...args) => {
            console.log(`[${level}] ${message}`, ...args)
        },
    },
    plugins: [
        admin({
            ac: ac,
            roles: roles,
            defaultRole: "user",
            adminRoles: ["owner", "admin"],
        }),
        twoFactor({
            issuer: env.VITE_APPNAME,
            backupCodeOptions: {
                amount: 10,
                storeBackupCodes: "encrypted",
            },
            twoFactorCookieMaxAge: 600, // 10 min 2 FA challenge window
            trustDeviceMaxAge: 60 * 60 * 24 * 30, // 30 day trusted device
        }),
        passkey({
            rpName: env.VITE_APPNAME,
            rpID: env.NODE_ENV === "production" ? env.COOKIE_DOMAIN : undefined,
        }),
        openAPI({
            path: "docs",
        }),
        r2Provider({
            binding: env.STORAGE,
            isAdmin: isAdminTier,
        }),
        infraPayment({
            apiToken: env.PAWAPAY_API_TOKEN,
            environment: env.PAWAPAY_ENV === "production" ? "production" : "sandbox",
            cache: env.PAYMENTS,
            isAdmin: isAdminTier,
            onPaymentCompleted: sendPaymentReceiptEmail,
        }),
        jwt({
            disableSettingJwtHeader: true,
        }),
        oauthProvider({
            // hosted on www, not infra itself — infra only keeps /setup,
            // admin /sign-in, and /forgot-password
            loginPage: `${env.WWW_URL}/sign-in`,
            consentPage: `${env.WWW_URL}/consent`,
            signUp: {
                page: `${env.WWW_URL}/create-account`,
            },
            storeClientSecret: "hashed",
            allowDynamicClientRegistration: false,
            // admin-created clients (via adminCreateOAuthClient, no session)
            // have no matching userId, so the default "caller owns this
            // client" privilege check would reject every admin action on
            // them — admin/owner manage every client instance-wide instead
            clientPrivileges: async ({ user }) =>
                isAdminTier((user?.role as string | undefined) ?? ""),
            scopes: ["openid", "profile", "email", "offline_access", "payments"],
            rateLimit: {
                authorize: { window: 60, max: 50 },
                token: { window: 60, max: 30 },
                register: { window: 60, max: 5 },
            },
            accessTokenExpiresIn: 60 * 60, // 1 hour
            refreshTokenExpiresIn: 60 * 60 * 24 * 365, // 1 year, rotates forward on every use
            codeExpiresIn: 60 * 10, // 10 minutes
            refreshTokenGracePeriod: 30,
            // defaults to [baseURL] when omitted; add this instance's other
            // deployed services here as they exist, not guessed in advance
            validAudiences: [env.BETTER_AUTH_URL],
            silenceWarnings: {
                oauthAuthServerConfig: true,
                openidConfig: true,
            },
            customUserInfoClaims: async ({ user, scopes }) => ({
                scopes: scopes,
                ...user,
            }),
        }),
        tanstackStartCookies(),
    ],
})
