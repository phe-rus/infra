import { tanstackStartCookies } from "better-auth/tanstack-start"
import { oauthProvider } from "@better-auth/oauth-provider"
import { AsyncLocalStorage } from "async_hooks"
import { passkey } from "@better-auth/passkey"
import { ac, buildRoles, isAdminTier } from "./utils/permissions"
import { password } from "./utils/password"
import { env } from "cloudflare:workers"
import { betterAuth } from "better-auth"
import { secondaryStorage, trustedOrigins, databaseHooks, customStorage } from "./configs"
import { advanced } from './advanced'
import { r2 } from "./plugins/r2"
import {
    admin,
    jwt,
    openAPI,
    twoFactor,
} from "better-auth/plugins"

export const execCtxStorage = new AsyncLocalStorage<ExecutionContext>()
const roles = buildRoles()

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    appName: env.VITE_APPNAME,
    database: env.AUTH_DB,
    experimental: { joins: true },
    trustedOrigins: trustedOrigins,
    emailAndPassword: {
        enabled: true,
        revokeSessionsOnPasswordReset: true,
        resetPasswordTokenExpiresIn: 3600, // 1 hour
        password: password,
        autoSignIn: true,
        maxPasswordLength: 48,
        minPasswordLength: 8,
        requireEmailVerification: false
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            console.log(`[dev] Verification email for ${user.email}: ${url}`)
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24, // refresh if older than 24 h
        // required by oauthProvider: it needs to look sessions up by id
        // directly from the DB during the authorize/consent continuation,
        // not just from the KV-cached copy. D1's write budget (100K/day
        // free) easily absorbs this at self-hosted login volume
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
        storage: 'secondary-storage',
        customStorage: customStorage
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
            adminRoles: ['owner', "admin"],
        }),
        twoFactor({
            issuer: env.VITE_APPNAME,
            backupCodeOptions: {
                amount: 10,
                storeBackupCodes: 'encrypted'
            },
            twoFactorCookieMaxAge: 600, // 10 min 2 FA challenge window
            trustDeviceMaxAge: 60 * 60 * 24 * 30, // 30 day trusted device
        }),
        passkey({
            rpName: env.VITE_APPNAME,
            rpID: env.NODE_ENV === 'production' ? env.COOKIE_DOMAIN : undefined,
        }),
        openAPI({
            path: 'docs'
        }),
        r2(),
        jwt({
            disableSettingJwtHeader: true,
        }),
        oauthProvider({
            loginPage: "/sign-in",
            consentPage: "/consent",
            signUp: {
                page: "/create-account",
            },
            storeClientSecret: 'hashed',
            allowDynamicClientRegistration: false,
            // admin-created clients (via adminCreateOAuthClient, no session)
            // have no matching userId, so the default "caller owns this
            // client" privilege check would reject every admin action on
            // them — admin/owner manage every client instance-wide instead
            clientPrivileges: async ({ user }) => isAdminTier((user?.role as string | undefined) ?? ""),
            scopes: ["openid", "profile", "email", "offline_access"],
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
            customUserInfoClaims: async ({ user, scopes }) => ({
                scopes: scopes,
                ...user
            }),
        }),
        tanstackStartCookies()
    ]
})
