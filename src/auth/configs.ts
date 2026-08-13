import { type BetterAuthOptions } from "better-auth/types"
import { env } from "cloudflare:workers"

type OptionsProps = Partial<BetterAuthOptions>
const secondaryStorage = {
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
} satisfies OptionsProps['secondaryStorage']

const customStorage = {
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
} satisfies NonNullable<OptionsProps['rateLimit']>['customStorage']

const databaseHooks = {
    user: {
        create: {
            before: async (user, ctx) => {
                if (ctx?.path !== "/sign-up/email") return { data: user }
                const adapter = ctx.context.adapter
                const count = await adapter.count({ model: "user" })
                return {
                    data: {
                        ...user,
                        role: count > 0 ? 'user' : 'owner'
                    }
                }
            }
        }
    }
} satisfies OptionsProps['databaseHooks']

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

export {
    secondaryStorage,
    customStorage,
    databaseHooks,
    trustedOrigins
}