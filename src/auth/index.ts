import { env } from "cloudflare:workers"
import { betterAuth } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"
import {
    admin,
    anonymous,
    emailOTP,
    magicLink,
    phoneNumber,
    twoFactor,
    username,
} from "better-auth/plugins"
import { passkey } from "@better-auth/passkey"
import { apiKey } from "@better-auth/api-key"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { ac, roles } from "./permissions"
import { password } from "./password"
import { getEnabledMethods, methodForPath } from "./settings/methods"
import { getAppName } from "./settings/instance"

const FIRST_USER_ROLE = "owner"
const appName = await getAppName()

export const auth = betterAuth({
    appName: appName,
    database: env.AUTH_DB,
    emailAndPassword: {
        enabled: true,
        password,
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
                    const adapter = ctx?.context?.adapter
                    if (!adapter) return { data: user }

                    const count = await adapter.count({ model: "user" })
                    if (count > 0) {
                        throw new APIError("FORBIDDEN", {
                            message: "Sign-up is disabled: this instance already has an owner account.",
                        })
                    }
                    return { data: { ...user, role: FIRST_USER_ROLE } }
                },
            },
        },
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            const adapter = ctx?.context?.adapter
            if (!adapter) return
            const count = await adapter.count({ model: 'user' })
            if (count === 0) {
                throw ctx.redirect("/setup")
            }
            const method = methodForPath(ctx.path)
            if (!method) return

            const enabled = await getEnabledMethods()
            if (!enabled[method]) {
                throw new APIError("FORBIDDEN", {
                    message: `${method} is disabled on this instance.`,
                })
            }
        })
    },
    plugins: [
        admin({
            ac,
            roles,
            defaultRole: "user",
            adminRoles: [FIRST_USER_ROLE],
        }),
        twoFactor({
            issuer: appName,
        }),
        username(),
        anonymous(),
        passkey(),
        apiKey(),
        phoneNumber({
            sendOTP: async ({ phoneNumber, code }) => {
                console.log(`[dev] SMS OTP for ${phoneNumber}: ${code}`)
            }
        }),
        magicLink({
            sendMagicLink: async ({ email, url }) => {
                console.log(`[dev] Magic link for ${email}: ${url}`)
            }
        }),
        emailOTP({
            sendVerificationOTP: async ({ email, otp }) => {
                console.log(`[dev] Email OTP for ${email}: ${otp}`)
            }
        }),
        tanstackStartCookies()
    ]
})
