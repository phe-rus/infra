import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { AdminMiddleware } from "@/kit/middleware"

const ACTIVE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

export const getStats = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const headers = getRequestHeaders()
        const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString()
        const [{ total: totalUsers }, { total: monthlyActiveUsers }] = await Promise.all([
            auth.api.listUsers({ headers, query: { limit: 1 } }),
            auth.api.listUsers({
                headers,
                query: { limit: 1, filterField: "updatedAt", filterOperator: "gte", filterValue: cutoff },
            }),
        ])
        return { totalUsers, monthlyActiveUsers }
    })
