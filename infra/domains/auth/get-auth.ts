import { queryOptions } from "@tanstack/react-query"
import { getFirstUserStatus, getSession, protectedSession } from "./func"

export const meOptions = () =>
    queryOptions({
        queryKey: ["me"],
        queryFn: getSession,
    })

export const protectedOptions = () =>
    queryOptions({
        queryKey: ["protected"],
        queryFn: protectedSession,
    })

export const setupOptions = () =>
    queryOptions({
        queryKey: ["setup"],
        queryFn: getFirstUserStatus,
    })
