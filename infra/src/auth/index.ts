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
import { rateLimitStorage } from "./rate-limit-storage"
import { r2Provider } from "@infra/r2"
import { infraPayment } from "@infra/payment"
import { admin, jwt, openAPI, twoFactor, haveIBeenPwned } from "better-auth/plugins"

const roles = buildRoles()

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    appName: env.VITE_APPNAME,
    database: env.AUTH_DB,
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
            maxAge: 60 * 60 * 4, // 4-hour browser-side cache
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
        customStorage: rateLimitStorage,
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
        jwt({
            disableSettingJwtHeader: true,
        }),
        oauthProvider({
            loginPage: `${env.WWW_URL}/sign-in`,
            consentPage: `${env.WWW_URL}/consent`,
            signUp: {
                page: `${env.WWW_URL}/create-account`,
            },
            storeClientSecret: "hashed",
            allowDynamicClientRegistration: false,
            clientPrivileges: async ({ user }) =>
                isAdminTier((user?.role as string | undefined) ?? ""),
            scopes: ["openid", "profile", "email", "offline_access", "payments"],
            rateLimit: {
                authorize: { window: 60, max: 50 },
                token: { window: 60, max: 30 },
                register: { window: 60, max: 5 },
            },
            accessTokenExpiresIn: 60 * 60, // 1 hour
            refreshTokenExpiresIn: 60 * 60 * 24 * 30, // 30 days, rotates forward on every use
            codeExpiresIn: 60 * 2, // 2 minutes — exchanged immediately after the redirect
            refreshTokenGracePeriod: 30,
            resources: [env.BETTER_AUTH_URL],
            customUserInfoClaims: async ({ user, scopes, jwt }) => ({
                scopes: scopes,
                clientId: typeof jwt.client_id === "string" ? jwt.client_id : null,
                ...user,
            }),
        }),
        ...(env.NODE_ENV === "production"
            ? [haveIBeenPwned()]
            : [
                  openAPI({
                      path: "docs",
                  }),
              ]),
        tanstackStartCookies(),
    ],
})
