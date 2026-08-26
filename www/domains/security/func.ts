import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { authClient } from "@/lib/auth-client"

export const fetchPasskeys = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders()
    const { data, error } = await authClient.passkey.listUserPasskeys({
        fetchOptions: { headers },
    })
    if (error) throw new Error(error.message ?? "Could not load your passkeys")
    return data
})

export type PasskeysData = Awaited<ReturnType<typeof fetchPasskeys>>

export const fetchSessions = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders()
    const { data, error } = await authClient.listSessions({
        fetchOptions: { headers },
    })
    if (error) throw new Error(error.message ?? "Could not load your sessions")
    return data
})

export type SessionsData = Awaited<ReturnType<typeof fetchSessions>>
