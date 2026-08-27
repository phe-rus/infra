import { authClient } from "@/lib/auth-client"

const ACTIVE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

export async function getStats() {
    const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString()
    const [
        { data: totals, error: totalsError },
        { data: monthly, error: monthlyError },
    ] = await Promise.all([
        authClient.admin.listUsers({
            query: { limit: 1 },
        }),
        authClient.admin.listUsers({
            query: {
                limit: 1,
                filterField: "updatedAt",
                filterOperator: "gte",
                filterValue: cutoff,
            },
        }),
    ])
    const error = totalsError ?? monthlyError
    if (error) throw new Error(error.message ?? "Could not load stats")
    return {
        totalUsers: totals?.total ?? 0,
        monthlyActiveUsers: monthly?.total ?? 0,
    }
}

export type StatsData = Awaited<ReturnType<typeof getStats>>
