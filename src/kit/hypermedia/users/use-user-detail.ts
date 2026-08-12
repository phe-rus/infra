import { queryOptions, useQuery } from "@tanstack/react-query"
import { userDetailQueryOptions } from "./user-detail-query-options"

export const useUserDetail = (userId: string | null) =>
    useQuery(
        queryOptions({
            ...userDetailQueryOptions(userId ?? ""),
            enabled: Boolean(userId),
        })
    )
