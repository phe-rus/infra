import { queryOptions } from "@tanstack/react-query"
import { getSession, getSetupStatus } from "./fnc"

export const meQueryOptions = () =>
    queryOptions({
        queryKey: ["me"],
        queryFn: () => getSession(),
    })

export const setupStatusQueryOptions = () =>
    queryOptions({
        queryKey: ["setup"],
        queryFn: () => getSetupStatus(),
    })
