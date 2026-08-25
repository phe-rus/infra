import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { getUserDetail, listUsers } from "./fnc"

export const usersOptions = () =>
    queryOptions({
        queryKey: ["users"],
        queryFn: () => listUsers(),
    })

export const useUsers = () => useSuspenseQuery(usersOptions())

export const userDetailOptions = (userId: string) =>
    queryOptions({
        queryKey: ["users", userId],
        queryFn: () => getUserDetail({ data: { userId } }),
        enabled: Boolean(userId),
    })

export const useUserDetail = (userId: string | null) =>
    useQuery(
        queryOptions({
            ...userDetailOptions(userId ?? ""),
            enabled: Boolean(userId),
        })
    )
