import type { BetterAuthOptions } from "better-auth/types"
import { env } from "cloudflare:workers"

type RateLimitStorage = NonNullable<NonNullable<BetterAuthOptions["rateLimit"]>["customStorage"]>
type RateLimitData = { key: string; count: number; lastRequest: number }

// better-auth builds every rate-limit key as `${ip}|${path}` before it ever
// reaches this storage, so the path is always the remainder after the first
// `|`. Only /pay/* needs a counter every edge isolate agrees on (someone
// spreading deposit/payout requests across edges to dodge a limit is a real
// abuse case), everything else is deterrence, not a security boundary, so it
// stays in this isolate's own memory and never touches KV
const memoryStore = new Map<string, RateLimitData>()

function needsSharedCounter(key: string): boolean {
    const path = key.slice(key.indexOf("|") + 1)
    return path.startsWith("/pay/")
}

export const rateLimitStorage: RateLimitStorage = {
    get: async (key) => {
        if (!needsSharedCounter(key)) return memoryStore.get(key) ?? null
        const value = await env.RL.get(key)
        if (!value) return null
        const data = JSON.parse(value) as RateLimitData
        data.key = key
        return data
    },
    set: async (key, value, ttl) => {
        const data = value as RateLimitData
        data.key = key
        if (!needsSharedCounter(key)) {
            memoryStore.set(key, data)
            return
        }
        const expirationTtl = typeof ttl === "number" ? Math.max(ttl, 60) : 60
        await env.RL.put(key, JSON.stringify(data), { expirationTtl })
    },
    // consume is the only path better-auth's rate limiter actually calls
    // when it's defined (get/set above only run as a legacy fallback), so
    // this is where the KV-vs-memory split really happens
    consume: async (key, rule) => {
        const now = Math.floor(Date.now() / 1000)
        const useKv = needsSharedCounter(key)

        const stored = useKv ? await env.RL.get(key) : null
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
            await env.RL.put(key, JSON.stringify(data), { expirationTtl: kvTtl })
        } else {
            memoryStore.set(key, data)
        }

        return { allowed: true, retryAfter: null }
    },
}
