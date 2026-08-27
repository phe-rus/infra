import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { authClient } from "@/lib/auth-client"
import { AdminMiddleware } from "@/middleware"

const ACTIVE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

export const getStats = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const headers = Object.fromEntries(Object.entries(getRequestHeaders()))
        const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString()
        const [
            { data: totals, error: totalsError },
            { data: monthly, error: monthlyError },
        ] = await Promise.all([
            authClient.admin.listUsers({
                query: { limit: 1 },
                fetchOptions: { headers },
            }),
            authClient.admin.listUsers({
                query: {
                    limit: 1,
                    filterField: "updatedAt",
                    filterOperator: "gte",
                    filterValue: cutoff,
                },
                fetchOptions: { headers },
            }),
        ])
        const error = totalsError ?? monthlyError
        if (error) throw new Error(error.message ?? "Could not load stats")
        return {
            totalUsers: totals?.total ?? 0,
            monthlyActiveUsers: monthly?.total ?? 0,
        }
    })

export type StatsData = Awaited<ReturnType<typeof getStats>>
