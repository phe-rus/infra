import { queryOptions } from "@tanstack/react-query"
import { getEventMetrics, getRecentEvents, getStats } from "./func"

export const statsOptions = () =>
    queryOptions({
        queryKey: ["stats"],
        queryFn: () => getStats(),
    })

export const recentEventsOptions = () =>
    queryOptions({
        queryKey: ["stats", "recent-events"],
        queryFn: () => getRecentEvents(),
    })

export const eventMetricsOptions = () =>
    queryOptions({
        queryKey: ["stats", "event-metrics"],
        queryFn: () => getEventMetrics(),
    })
