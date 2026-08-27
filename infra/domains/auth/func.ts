import { getRequestHeaders, setResponseHeaders } from "@tanstack/react-start/server"
import { createServerFn } from "@tanstack/react-start"
import { authClient } from "@/lib/auth-client"
import { rpc } from "@/lib/rpc-client"
import { AdminMiddleware } from "@/middleware"

function headers() {
    return Object.fromEntries(Object.entries(getRequestHeaders()))
}

export const getSession = createServerFn({ method: "GET" })
    .handler(async () => {
        const { data } = await authClient.getSession({
            fetchOptions: { headers: headers() },
        })
        return data
    })

export const protectedSession = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async ({ context }) => {
        return context.sessions
    })

export const getFirstUserStatus = createServerFn({ method: "GET" })
    .handler(async () => {
        try {
            const res = await rpc.api["first-user"].$get()
            if (res.headers) {
                setResponseHeaders(res.headers)
            }
            const hasAdmin = await res.json()
            return { hasAdmin }
        } catch {
            return { hasAdmin: false }
        }
    })
