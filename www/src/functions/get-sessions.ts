import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

const fetchSessions = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders()
    const { data, error } = await authClient.listSessions({
        fetchOptions: { headers },
    })
    if (error) throw new Error(error.message ?? "Could not load your sessions")
    return data
})

export const sessionsOptions = () =>
    queryOptions({
        queryKey: ["sessions"],
        queryFn: () => fetchSessions(),
    })

export const useSessions = () => useSuspenseQuery(sessionsOptions())
