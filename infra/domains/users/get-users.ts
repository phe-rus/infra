import { queryOptions } from "@tanstack/react-query"
import { getUserDetail, getUserWallet, listUsers } from "./func"

export const usersOptions = () =>
    queryOptions({
        queryKey: ["users"],
        queryFn: () => listUsers(),
    })

export const userDetailOptions = (userId: string) =>
    queryOptions({
        queryKey: ["users", userId],
        queryFn: () => getUserDetail({ data: { userId } }),
        enabled: Boolean(userId),
    })

export const userWalletOptions = (userId: string) =>
    queryOptions({
        queryKey: ["users", userId, "wallet"],
        queryFn: () => getUserWallet({ data: { userId } }),
        enabled: Boolean(userId),
    })
