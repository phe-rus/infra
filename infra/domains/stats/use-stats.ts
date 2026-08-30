import { useSuspenseQuery } from "@tanstack/react-query"
import { eventMetricsOptions, recentEventsOptions, statsOptions } from "./get-stats"

export const useStats = () => useSuspenseQuery(statsOptions())
export const useRecentEvents = () => useSuspenseQuery(recentEventsOptions())
export const useEventMetrics = () => useSuspenseQuery(eventMetricsOptions())
