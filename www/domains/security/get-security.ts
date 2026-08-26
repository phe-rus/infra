import { queryOptions } from "@tanstack/react-query"
import { fetchPasskeys, fetchSessions } from "./func"

export const passkeysOptions = () =>
    queryOptions({
        queryKey: ["passkeys"],
        queryFn: () => fetchPasskeys(),
    })

export const sessionsOptions = () =>
    queryOptions({
        queryKey: ["sessions"],
        queryFn: () => fetchSessions(),
    })
