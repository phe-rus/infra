import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { openAPI, haveIBeenPwned } from "better-auth/plugins"
import type { BetterAuthPlugin } from "better-auth/types"
import { createSessionOptions, type SessionEmailCallbacks } from "./core/session"
import { createAdvanced } from "./core/advanced"
import { createSecondaryStorage } from "./core/storage"
import { createRateLimitStorage } from "./core/rate-limit"
import { databaseHooks } from "./core/hooks"
import { createTrustedOrigins } from "./core/trusted-origins"
import { isAdminTier } from "./core/permissions"
import { createAdminPlugin } from "./plugins/admin"
import { createTwoFactorPlugin } from "./plugins/two-factor"
import { createPasskeyPlugin } from "./plugins/passkey"
import { createJwtPlugin } from "./plugins/jwt"
import {
    createOAuthProviderPlugin,
    type CreateOAuthProviderOptions,
} from "./plugins/oauth-provider"

export { isAdminTier, isOwner, FIXED_ROLE_NAMES } from "./core/permissions"
export { isTrustedOrigin } from "./core/trusted-origins"

export type CreateAuthOptions<TPlugins extends readonly BetterAuthPlugin[] = []> = {
    baseURL: string
    appName: string
    database: D1Database
    isProduction: boolean
    cookieDomain?: string
    disabledPaths?: string[]
    /** Origin allowlist as a comma-separated string, e.g. "pherus.org,localhost". */
    trustedOrigins: string
    cache: KVNamespace
    /** KV binding backing the rate limiter's shared (cross-isolate) counters. */
    rateLimitKV: KVNamespace
    /** Path prefixes given an explicit rate-limit rule (window: 60s, max: 100), e.g. ["/pay/*", "/r2/*", "/cdn/**"]. */
    rateLimitPaths: string[]
    /** Subset of rateLimitPaths' prefixes that need a real, cross-isolate KV counter rather than per-isolate memory — usually just the money-moving ones. */
    sharedCounterPrefixes: string[]
    emails: SessionEmailCallbacks
    /** Every resource this instance issues OAuth tokens for. */
    oauth: Omit<CreateOAuthProviderOptions, "isAdmin">
    /**
     * App-specific plugins this instance also needs (e.g. a payment or
     * storage plugin) — appended after the core identity-provider plugins.
     * `createAuth` is generic over this tuple specifically so each plugin's
     * literal type (and therefore its contributed auth.api methods) survives
     * being passed through this factory instead of widening to the generic
     * BetterAuthPlugin type, which would otherwise collapse auth.api down to
     * just the built-in endpoints.
     */
    plugins?: TPlugins
}

export function createAuth<const TPlugins extends readonly BetterAuthPlugin[] = []>(
    options: CreateAuthOptions<TPlugins>
) {
    return betterAuth({
        baseURL: options.baseURL,
        appName: options.appName,
        database: options.database,
        trustedOrigins: createTrustedOrigins(options.trustedOrigins, options.baseURL),
        disabledPaths: options.disabledPaths ?? ["/token"],
        ...createSessionOptions(options.emails),
        rateLimit: {
            enabled: true,
            window: 60,
            max: 100,
            storage: "secondary-storage",
            customRules: Object.fromEntries(
                options.rateLimitPaths.map((path) => [path, { window: 60, max: 100 }])
            ),
            customStorage: createRateLimitStorage(
                options.rateLimitKV,
                options.sharedCounterPrefixes
            ),
        },
        secondaryStorage: createSecondaryStorage(options.cache),
        databaseHooks,
        advanced: createAdvanced({
            appName: options.appName,
            isProduction: options.isProduction,
            cookieDomain: options.cookieDomain,
        }),
        logger: {
            disabled: false,
            disableColors: false,
            level: "warn",
            log: (level, message, ...args) => {
                console.log(`[${level}] ${message}`, ...args)
            },
        },
        plugins: [
            createAdminPlugin(),
            createTwoFactorPlugin(options.appName),
            createPasskeyPlugin({
                appName: options.appName,
                isProduction: options.isProduction,
                cookieDomain: options.cookieDomain,
            }),
            createJwtPlugin(),
            createOAuthProviderPlugin({ ...options.oauth, isAdmin: isAdminTier }),
            ...(options.plugins ?? []),
            ...(options.isProduction ? [haveIBeenPwned()] : [openAPI({ path: "docs" })]),
            tanstackStartCookies(),
        ],
    })
}
