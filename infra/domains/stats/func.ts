import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { env } from "cloudflare:workers"
import { auth } from "@/auth"
import { AdminMiddleware } from "@/middleware"

const ACTIVE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

type AnalyticsQueryResult<T> = {
    meta: { name: string; type: string }[]
    data: T[]
    rows: number
}

async function queryAnalytics<T>(sql: string): Promise<T[]> {
    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/analytics_engine/sql`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${env.CF_ANALYTICS_API_TOKEN}` },
            body: sql,
        }
    )
    if (!res.ok) {
        throw new Error(`Analytics query failed: ${res.status} ${await res.text()}`)
    }
    const json = await res.json<AnalyticsQueryResult<T>>()
    return json.data
}

type RecentEventRow = {
    timestamp: string
    category: string
    event: string
    outcome: string
    actor: string
    target: string
    ip: string
    country: string
    city: string
    region: string
}

export const getRecentEvents = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const events = await queryAnalytics<RecentEventRow>(
            `SELECT timestamp, blob1 AS category, blob2 AS event, blob3 AS outcome, blob4 AS actor, blob5 AS target, blob6 AS ip, blob7 AS country, blob8 AS city, blob9 AS region FROM auth ORDER BY timestamp DESC LIMIT 100 FORMAT JSON`
        )
        return { events }
    })

export type RecentEventsData = Awaited<ReturnType<typeof getRecentEvents>>

export const getEventMetrics = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const [authByPath, managementByAction, authDaily, managementDaily] =
            await Promise.all([
                queryAnalytics<{ path: string; count: number }>(
                    `SELECT blob2 AS path, count() AS count FROM auth WHERE blob1 = 'auth' AND timestamp > NOW() - INTERVAL '7' DAY GROUP BY path ORDER BY count DESC FORMAT JSON`
                ),
                queryAnalytics<{ action: string; count: number }>(
                    `SELECT blob2 AS action, count() AS count FROM auth WHERE blob1 = 'management' AND timestamp > NOW() - INTERVAL '7' DAY GROUP BY action ORDER BY count DESC FORMAT JSON`
                ),
                queryAnalytics<{ day: string; outcome: string; count: number }>(
                    `SELECT toStartOfInterval(timestamp, INTERVAL '1' DAY) AS day, blob3 AS outcome, count() AS count FROM auth WHERE blob1 = 'auth' AND timestamp > NOW() - INTERVAL '14' DAY GROUP BY day, outcome ORDER BY day ASC FORMAT JSON`
                ),
                queryAnalytics<{ day: string; count: number }>(
                    `SELECT toStartOfInterval(timestamp, INTERVAL '1' DAY) AS day, count() AS count FROM auth WHERE blob1 = 'management' AND timestamp > NOW() - INTERVAL '14' DAY GROUP BY day ORDER BY day ASC FORMAT JSON`
                ),
            ])
        return { authByPath, managementByAction, authDaily, managementDaily }
    })

export type EventMetricsData = Awaited<ReturnType<typeof getEventMetrics>>

export const getStats = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const headers = getRequestHeaders()
        const cutoff = Date.now() - ACTIVE_WINDOW_MS
        const [{ total: totalUsers }, { total: monthlyActiveUsers }] =
            await Promise.all([
                auth.api.listUsers({ headers, query: { limit: 1 } }),
                auth.api.listUsers({
                    headers,
                    query: {
                        limit: 1,
                        filterField: "lastActiveAt",
                        filterOperator: "gte",
                        filterValue: cutoff,
                    },
                }),
            ])
        return { totalUsers, monthlyActiveUsers }
    })

export type StatsData = Awaited<ReturnType<typeof getStats>>
