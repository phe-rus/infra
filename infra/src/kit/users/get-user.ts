import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { getUserDetail, listUsers } from "./fnc"

export const usersQueryOptions = () =>
    queryOptions({
        queryKey: ["users"],
        queryFn: () => listUsers(),
    })

export const useUsers = () => useSuspenseQuery(usersQueryOptions())

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
