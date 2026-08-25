import type { BetterAuthOptions } from "better-auth/types"

type RateLimitStorage = NonNullable<NonNullable<BetterAuthOptions["rateLimit"]>["customStorage"]>
type RateLimitData = { key: string; count: number; lastRequest: number }

// better-auth builds every rate-limit key as `${ip}|${path}` before it ever
// reaches this storage, so the path is always the remainder after the first
// `|`. Only paths matching sharedCounterPrefixes need a counter every edge
// isolate agrees on (someone spreading requests across edges to dodge a
// limit is a real abuse case there); everything else is deterrence, not a
// security boundary, so it stays in this isolate's own memory and never
// touches KV
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
        // the only operation better-auth 1.7's rate limiter accepts — it
        // dropped the legacy get/set shape entirely since it can't enforce a
        // distributed limit under concurrent requests, so this is where the
        // KV-vs-memory split happens
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
                const retryAfter = Math.max(0, data.lastRequest + rule.window - now)
                return { allowed: false, retryAfter: retryAfter || 1 }
            }

            data.count += 1
            data.key = key

            if (useKv) {
                const kvTtl = Math.max(rule.window, 60)
                await kv.put(key, JSON.stringify(data), { expirationTtl: kvTtl })
            } else {
                memoryStore.set(key, data)
            }

            return { allowed: true, retryAfter: null }
        },
    }
}
