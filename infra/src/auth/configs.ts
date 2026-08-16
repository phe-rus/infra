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
    const fallbackOrigin = env.BETTER_AUTH_URL ?? 'https://infra.pherus.org'
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
    databaseHooks,
    trustedOrigins
}