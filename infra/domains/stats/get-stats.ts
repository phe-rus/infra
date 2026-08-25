import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { getStats } from "./fnc"

export const statsOptions = () =>
    queryOptions({
        queryKey: ["stats"],
        queryFn: () => getStats(),
    })

export const useStats = () => useSuspenseQuery(statsOptions())
