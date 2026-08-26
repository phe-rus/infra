import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { openAPI, haveIBeenPwned } from "better-auth/plugins"
import type { BetterAuthPlugin } from "better-auth/types"
import {
    createSessionOptions,
    type SessionEmailCallbacks,
} from "./core/session"
import { createAdvanced } from "./core/advanced"
import {
    createSecondaryStorage,
    createRateLimitStorage,
} from "./core/storage"
import { databaseHooks, isAdminTier } from "./core/permissions"
import { createTrustedOrigins } from "./core/trusted-origins"
import { config, type CreateOAuthProviderOptions } from "./config"

export { isAdminTier, FIXED_ROLE_NAMES } from "./core/permissions"
export { isTrustedOrigin } from "./core/trusted-origins"

export type CreateAuthOptions<
    TPlugins extends readonly BetterAuthPlugin[] = [],
> = {
    baseURL: string
    appName: string
    database: D1Database
    isProduction: boolean
    cookieDomain?: string
    disabledPaths?: string[]
    /** Origin allowlist as a comma-separated string, e.g. "pherus.org,localhost". */
    trustedOrigins: string
    cache: KVNamespace
    rateLimit: {
        /** KV binding backing the rate limiter's shared (cross-isolate) counters. */
        binding: KVNamespace
        /** Path prefixes given an explicit rate-limit rule (window: 60s, max: 100), e.g. ["/pay/*", "/r2/*", "/cdn/**"]. */
        paths: string[]
        /** Subset of paths' prefixes that need a real, cross-isolate KV counter rather than per-isolate memory, usually just the money-moving ones. */
        sharedCounterPrefixes: string[]
    }
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

export function createAuth<
    const TPlugins extends readonly BetterAuthPlugin[] = [],
>(options: CreateAuthOptions<TPlugins>) {
    return betterAuth({
        baseURL: options.baseURL,
        appName: options.appName,
        database: options.database,
        trustedOrigins: createTrustedOrigins(
            options.trustedOrigins,
            options.baseURL
        ),
        disabledPaths: options.disabledPaths ?? ["/token"],
        ...createSessionOptions(options.emails),
        rateLimit: {
            enabled: true,
            window: 60,
            max: 100,
            storage: "secondary-storage",
            customRules: Object.fromEntries(
                options.rateLimit.paths.map((path) => [
                    path,
                    { window: 60, max: 100 },
                ])
            ),
            customStorage: createRateLimitStorage(
                options.rateLimit.binding,
                options.rateLimit.sharedCounterPrefixes
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
            ...config({
                appName: options.appName,
                isProduction: options.isProduction,
                cookieDomain: options.cookieDomain,
                oauth: {
                    ...options.oauth,
                    isAdmin: isAdminTier,
                },
            }),
            ...(options.plugins ?? []),
            ...(options.isProduction
                ? [haveIBeenPwned()]
                : [openAPI({ path: "docs" })]),
            tanstackStartCookies(),
        ],
    })
}
