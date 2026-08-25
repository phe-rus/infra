import type { BetterAuthOptions } from "better-auth/types"

type OptionsProps = Partial<BetterAuthOptions>
type SecondaryStorage = NonNullable<OptionsProps["secondaryStorage"]>

export function createSecondaryStorage(cache: KVNamespace): SecondaryStorage {
    return {
        increment: async (key, ttl) => {
            const existing = await cache.get(key)
            const next = (existing ? Number(existing) : 0) + 1
            await cache.put(key, String(next), {
                expirationTtl: Math.max(ttl, 60),
            })
            return next
        },
        get: (key) => cache.get(key),
        set: (key, value, ttl) => {
            return cache.put(
                key,
                value,
                ttl
                    ? {
                          expirationTtl: Math.max(ttl, 60),
                      }
                    : undefined
            )
        },
        delete: (key) => cache.delete(key),
        getAndDelete: async (key) => {
            const value = await cache.get(key)
            if (value !== null) await cache.delete(key)
            return value
        },
    }
}

type RateLimitStorage = NonNullable<
    NonNullable<BetterAuthOptions["rateLimit"]>["customStorage"]
>
type RateLimitData = { key: string; count: number; lastRequest: number }

export function createRateLimitStorage(
    kv: KVNamespace,
    sharedCounterPrefixes: string[]
): RateLimitStorage {
    const memoryStore = new Map<string, RateLimitData>()

    function needsSharedCounter(key: string): boolean {
        const path = key.slice(key.indexOf("|") + 1)
        return sharedCounterPrefixes.some((prefix) => path.startsWith(prefix))
    }

    return {
        consume: async (key, rule) => {
            const now = Math.floor(Date.now() / 1000)
            const useKv = needsSharedCounter(key)

            const stored = useKv ? await kv.get(key) : null
            let data: RateLimitData | null = useKv
                ? stored
                    ? (JSON.parse(stored) as RateLimitData)
                    : null
                : (memoryStore.get(key) ?? null)

            if (!data || now - data.lastRequest > rule.window) {
                data = { key, count: 0, lastRequest: now }
            }

            if (data.count >= rule.max) {
                const retryAfter = Math.max(
                    0,
                    data.lastRequest + rule.window - now
                )
                return { allowed: false, retryAfter: retryAfter || 1 }
            }

            data.count += 1
            data.key = key

            if (useKv) {
                const kvTtl = Math.max(rule.window, 60)
                await kv.put(key, JSON.stringify(data), {
                    expirationTtl: kvTtl,
                })
            } else {
                memoryStore.set(key, data)
            }

            return { allowed: true, retryAfter: null }
        },
    }
}
