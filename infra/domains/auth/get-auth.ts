import { queryOptions } from "@tanstack/react-query"
import { getSession, protectedSession } from "./func"

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
