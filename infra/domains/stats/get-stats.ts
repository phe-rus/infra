import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { getStats } from "./fnc"

export const statsQueryOptions = () =>
    queryOptions({
        queryKey: ["stats"],
        queryFn: () => getStats(),
    })

export const useStats = () => useSuspenseQuery(statsQueryOptions())
