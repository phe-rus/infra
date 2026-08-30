import { tanstackStartCookies } from "better-auth/tanstack-start"
import { databaseHooks, isAdminTier } from "./core/permissions"
import { createTrustedOrigins } from "./core/trusted-origins"
import { oauthProvider } from "@better-auth/oauth-provider"
import { listUserAccounts } from "./core/admin-accounts"
import { betterAuth } from "better-auth/minimal"
import { passkey } from "@better-auth/passkey"
import { password } from "./config/password"
import { env } from "cloudflare:workers"
import { emailHooks } from "./emails"
import { assets } from "../../shared/assets/src"
import { dbContext } from "@/db"
import {
    admin,
    jwt,
    openAPI,
    haveIBeenPwned,
    twoFactor,
} from "better-auth/plugins"
import {
    createSecondaryStorage,
    createRateLimitStorage,
} from "./core/storage"

const isProduction = env.NODE_ENV === "production"
export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    appName: env.VITE_APPNAME,
    database: dbContext(),
    trustedOrigins: createTrustedOrigins(
        env.TRUSTED_ORIGINS,
        env.BETTER_AUTH_URL
    ),
    disabledPaths: ["/token"],
    emailAndPassword: {
        enabled: true,
        revokeSessionsOnPasswordReset: true,
        resetPasswordTokenExpiresIn: 3600, // 1 hour
        password,
        autoSignIn: true,
        maxPasswordLength: 48,
        minPasswordLength: 8,
        requireEmailVerification: true,
        sendResetPassword: emailHooks.sendResetPassword,
    },
    emailVerification: {
        autoSignInAfterVerification: true,
        sendOnSignIn: false,
        sendVerificationEmail: emailHooks.sendVerificationEmail,
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
            lastActiveAt: { type: "date", required: false, input: false },
        },
        deleteUser: {
            enabled: true,
            sendDeleteAccountVerification:
                emailHooks.sendDeleteAccountVerification,
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
            "/assets/*": { window: 60, max: 100 },
            "/get-session": { window: 60, max: 60 },
            "/sign-out": { window: 60, max: 20 },
            "/update-user": { window: 60, max: 15 },
            "/delete-user": { window: 60, max: 5 },
        },
        customStorage: createRateLimitStorage(env.RL, []),
    },
    secondaryStorage: createSecondaryStorage(env.CACHE),
    databaseHooks,
    advanced: {
        cookiePrefix: env.VITE_APPNAME.toLowerCase().trim(),
        useSecureCookies: isProduction,
        crossSubDomainCookies: {
            enabled: true,
            domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        },
        defaultCookieAttributes: {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'Lax',
        },
        ipAddress: {
            ipv6Subnet: 64,
            ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
            disableIpTracking: false,
        },
        database: {
            generateId: "uuid",
            joins: true,
        },
    },
    logger: {
        disabled: false,
        disableColors: false,
        level: "warn",
        log: (level, message, ...args) => {
            console.log(`[${level}] ${message}`, ...args)
        },
    },
    plugins: [
        admin(),
        assets({ binding: env.R2, isAdmin: isAdminTier }),
        listUserAccounts({ isAdmin: isAdminTier }),
        twoFactor({
            issuer: env.VITE_APPNAME.toLowerCase().trim(),
            backupCodeOptions: {
                amount: 10,
                storeBackupCodes: "encrypted",
            },
            twoFactorCookieMaxAge: 600, // 10 min 2FA challenge window
            trustDeviceMaxAge: 60 * 60 * 24 * 30, // 30 day trusted device
        }),
        passkey({
            rpName: env.VITE_APPNAME.toLowerCase().trim(),
            rpID: isProduction ? env.COOKIE_DOMAIN : undefined,
        }),
        jwt({
            disableSettingJwtHeader: true
        }),
        oauthProvider({
            loginPage: `${env.ACCOUNTS_URL}/sign-in`,
            consentPage: `${env.ACCOUNTS_URL}/consent`,
            signUp: {
                page: `${env.ACCOUNTS_URL}/create-account`,
            },
            storeClientSecret: "hashed",
            allowDynamicClientRegistration: false,
            clientPrivileges: async ({ user }) => {
                return isAdminTier((user?.role as string | undefined) ?? "")
            },
            scopes: [
                "openid",
                "profile",
                "email",
                "offline_access",
            ],
            rateLimit: {
                authorize: { window: 60, max: 50 },
                token: { window: 60, max: 30 },
                register: { window: 60, max: 5 },
            },
            accessTokenExpiresIn: 60 * 60, // 1 hour
            refreshTokenExpiresIn: 60 * 60 * 24 * 30, // 30 days, rotates forward on every use
            codeExpiresIn: 60 * 2, // 2 minutes — exchanged immediately after the redirect
            refreshTokenGracePeriod: 30,
            cachedTrustedClients: new Set([
                'seer',
                'pherus',
            ]),
            customUserInfoClaims: async ({ user, scopes, jwt }) => ({
                scopes: scopes,
                clientId:
                    typeof jwt.client_id === "string" ? jwt.client_id : null,
                ...user,
            }),
        }),
        ...(isProduction ? [haveIBeenPwned()] : [openAPI({ path: "docs" })]),
        tanstackStartCookies()
    ],
})
