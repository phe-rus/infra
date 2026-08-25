import { queryOptions } from "@tanstack/react-query"
import { getSession, protectedSession, getSetupStatus } from "./fnc"

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
        queryFn: getSetupStatus,
    })
