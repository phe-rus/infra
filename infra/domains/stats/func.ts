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

type AuthEventRow = {
    timestamp: string
    path: string
    outcome: string
    country: string
    region: string
}

type ManagementEventRow = {
    timestamp: string
    action: string
    actorId: string
    targetId: string
}

export const getRecentEvents = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const [authEvents, managementEvents] = await Promise.all([
            queryAnalytics<AuthEventRow>(
                `SELECT timestamp, blob1 AS path, blob2 AS outcome, blob3 AS country, blob4 AS region FROM auth ORDER BY timestamp DESC LIMIT 50 FORMAT JSON`
            ),
            queryAnalytics<ManagementEventRow>(
                `SELECT timestamp, blob1 AS action, blob2 AS actorId, blob3 AS targetId FROM management ORDER BY timestamp DESC LIMIT 50 FORMAT JSON`
            ),
        ])
        return { authEvents, managementEvents }
    })

export type RecentEventsData = Awaited<ReturnType<typeof getRecentEvents>>

export const getEventMetrics = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const [authByPath, managementByAction] = await Promise.all([
            queryAnalytics<{ path: string; count: number }>(
                `SELECT blob1 AS path, count() AS count FROM auth WHERE timestamp > NOW() - INTERVAL '7' DAY GROUP BY path ORDER BY count DESC FORMAT JSON`
            ),
            queryAnalytics<{ action: string; count: number }>(
                `SELECT blob1 AS action, count() AS count FROM management WHERE timestamp > NOW() - INTERVAL '7' DAY GROUP BY action ORDER BY count DESC FORMAT JSON`
            ),
        ])
        return { authByPath, managementByAction }
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
