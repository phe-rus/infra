import { queryOptions } from "@tanstack/react-query"
import { getUserDetail, listUsers } from "./func"

export const usersOptions = () =>
    queryOptions({
        queryKey: ["users"],
        queryFn: () => listUsers(),
    })

export const userDetailOptions = (userId: string) =>
    queryOptions({
        queryKey: ["users", userId],
        queryFn: () => getUserDetail(userId),
        enabled: Boolean(userId),
    })
