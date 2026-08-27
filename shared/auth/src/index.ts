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

export type EmailScope = "verify-email" | "reset-password" | "delete-account"

// deliberately structural, not an import of @infra/notify's own types —
// shared/auth stays agnostic to which (if any) notify-shaped plugin the
// app registers, same way it doesn't depend on @infra/payprovider either.
type NotifyPluginLike = {
    id: string
    emailHooks?: SessionEmailCallbacks
}

// email hooks aren't passed in directly (that's "dealing with the crap") —
// createAuth finds a plugin with id "notify" in the plugins array you
// already gave it and pulls its hooks out itself, gated by `email.enable`
// and optionally narrowed further by `email.scopes`.
function resolveEmailHooks(
    plugins: readonly BetterAuthPlugin[],
    email?: { enable: boolean; scopes?: EmailScope[] }
): SessionEmailCallbacks {
    const empty: SessionEmailCallbacks = {
        sendVerificationEmail: undefined,
        sendResetPassword: undefined,
        sendDeleteAccountVerification: undefined,
    }
    if (!email?.enable) return empty
    const notifyPlugin = plugins.find(
        (p) => p.id === "notify"
    ) as NotifyPluginLike | undefined
    const hooks = notifyPlugin?.emailHooks
    if (!hooks) return empty
    const scopes = email.scopes
    return {
        sendVerificationEmail:
            !scopes || scopes.includes("verify-email")
                ? hooks.sendVerificationEmail
                : undefined,
        sendResetPassword:
            !scopes || scopes.includes("reset-password")
                ? hooks.sendResetPassword
                : undefined,
        sendDeleteAccountVerification:
            !scopes || scopes.includes("delete-account")
                ? hooks.sendDeleteAccountVerification
                : undefined,
    }
}

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
    /** Whether to wire up email verification/reset-password/delete-account
     *  confirmation. Looks for a plugin with id "notify" in `plugins` and
     *  pulls its hooks out itself — register @infra/notify (or anything
     *  shaped like it) in `plugins` for this to have any effect. Defaults
     *  to false. */
    email?: {
        enable: boolean
        /** Narrows which of the notify plugin's hooks actually get wired, on top of whatever it was scoped to itself. Omit for all of them. */
        scopes?: EmailScope[]
    }
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
        ...createSessionOptions(
            resolveEmailHooks(options.plugins ?? [], options.email)
        ),
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
