import { queryOptions, useQuery } from "@tanstack/react-query"
import { getUserDetail } from "./fnc"

export const userDetailQueryOptions = (userId: string) =>
    queryOptions({
        queryKey: ["users", userId],
        queryFn: () => getUserDetail({ data: { userId } }),
        enabled: Boolean(userId),
    })

export const useUserDetail = (userId: string | null) =>
    useQuery(
        queryOptions({
            ...userDetailQueryOptions(userId ?? ""),
            enabled: Boolean(userId),
        })
    )
