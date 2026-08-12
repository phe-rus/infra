import { env } from "cloudflare:workers"
import { betterAuth } from "better-auth"
import { APIError } from "better-auth/api"
import {
    admin,
    twoFactor,
    username,
} from "better-auth/plugins"
import { passkey } from "@better-auth/passkey"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { ac, buildRoles } from "./permissions"
import { password } from "./password"
import { execCtxStorage } from "./execution-context"

const roles = buildRoles()

const trustedOrigins = async (
    request: Request | undefined
): Promise<string[]> => {
    const origin = request?.headers.get("origin") ?? ''
    const fallbackOrigin = env.BETTER_AUTH_URL ?? 'https://pass.pherus.org'
    if (!origin) {
        return [fallbackOrigin]
    }
    try {
        const { hostname } = new URL(origin)
        const isTrusted = env.TRUSTED_ORIGINS.split(",").some((suffix) => {
            const trusted = suffix.trim()
            return hostname === trusted || hostname.endsWith(`.${trusted}`)
        })
        return isTrusted ? [origin] : [fallbackOrigin]
    } catch {
        return [fallbackOrigin]
    }
}

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
        storeSessionInDatabase: false,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5-min browser-side cache
        },
    },
    rateLimit: {
        enabled: true,
        window: 60,
        max: 100,
        storage: 'secondary-storage',
        customStorage: {
            get: async (key) => {
                const ipKey = key.split("|")[0];
                const value = await env.RL.get(ipKey);
                if (!value) return null;

                const data = JSON.parse(value);
                if (data && typeof data === 'object') {
                    data.key = ipKey;
                }
                return data;
            },
            set: async (key, value, ttl) => {
                const ipKey = key.split("|")[0];

                if (value && typeof value === 'object') {
                    value.key = ipKey;
                }

                const stringValue = JSON.stringify(value);
                const expirationTtl = typeof ttl === 'number' ? Math.max(ttl, 60) : 60;
                await env.RL.put(ipKey, stringValue, { expirationTtl });
            },
            consume: async (key, rule) => {
                const ipKey = key.split("|")[0];

                const now = Math.floor(Date.now() / 1000);
                const value = await env.RL.get(ipKey);

                let data = value ? JSON.parse(value) as { key?: string; count: number; lastRequest: number } : null;

                if (!data || (now - data.lastRequest) > rule.window) {
                    data = { key: ipKey, count: 0, lastRequest: now };
                }

                if (data.count >= rule.max) {
                    const retryAfter = Math.max(0, (data.lastRequest + rule.window) - now);
                    return {
                        allowed: false,
                        retryAfter: retryAfter || 1
                    };
                }

                data.count += 1;
                data.key = ipKey;

                const kvTtl = Math.max(rule.window, 60);
                await env.RL.put(ipKey, JSON.stringify(data), {
                    expirationTtl: kvTtl
                });

                return {
                    allowed: true,
                    retryAfter: null
                };
            }
        }
    },
    secondaryStorage: {
        get: (key) => env.CACHE.get(key),
        set: (key, value, ttl) => {
            return env.CACHE.put(key, value, ttl ? {
                expirationTtl: Math.max(ttl, 60)
            } : undefined)
        },
        delete: (key) => env.CACHE.delete(key),
        getAndDelete: async (key) => {
            const value = await env.CACHE.get(key)
            if (value !== null) await env.CACHE.delete(key)
            return value
        }
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user, ctx) => {
                    // this gate is only for the public self-service sign-up flow
                    // (/sign-up/email, used by setupFn.ts's completeSetup); a user
                    // created via /admin/create-user (the dashboard's "Add user")
                    // is already an authenticated owner/admin action and must not
                    // be blocked just because an owner already exists
                    if (ctx?.path !== "/sign-up/email") return { data: user }

                    const adapter = ctx.context.adapter
                    const count = await adapter.count({ model: "user" })
                    if (count > 0) {
                        throw new APIError("FORBIDDEN", {
                            message: "Sign-up is disabled: this instance already has an owner account.",
                        })
                    }
                    return {
                        data: {
                            ...user,
                            role: 'owner'
                        }
                    }
                },
            },
        },
    },
    advanced: {
        cookiePrefix: env.VITE_APPNAME,
        useSecureCookies: true,
        crossSubDomainCookies: {
            enabled: true,
            domain: env.NODE_ENV === 'production' ? env.COOKIE_DOMAIN : undefined,
        },
        defaultCookieAttributes: {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        },
        ipAddress: {
            ipv6Subnet: 64,
            ipAddressHeaders: ["cf-connecting-ip"],
            disableIpTracking: false,
        },
        database: {
            generateId: 'uuid',
        },
        backgroundTasks: {
            handler: (p) => execCtxStorage.getStore()?.waitUntil(p),
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
        username(),
        passkey({
            rpName: env.VITE_APPNAME,
            rpID: env.NODE_ENV === 'production' ? env.COOKIE_DOMAIN : undefined,
        }),
        tanstackStartCookies(),
    ],
})
