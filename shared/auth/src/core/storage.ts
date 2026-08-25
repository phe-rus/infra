import type { BetterAuthOptions } from "better-auth/types"

type OptionsProps = Partial<BetterAuthOptions>
type SecondaryStorage = NonNullable<OptionsProps["secondaryStorage"]>

export function createSecondaryStorage(cache: KVNamespace): SecondaryStorage {
    return {
        // required by SecondaryStorage's type since better-auth 1.7, but never
        // actually called here: rateLimit.customStorage (rate-limit.ts) always
        // takes precedence over a secondary-storage-backed limiter, so this
        // only exists to satisfy the interface
        increment: async (key, ttl) => {
            const existing = await cache.get(key)
            const next = (existing ? Number(existing) : 0) + 1
            await cache.put(key, String(next), { expirationTtl: Math.max(ttl, 60) })
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
