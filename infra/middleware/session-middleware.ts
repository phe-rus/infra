import { createMiddleware } from "@tanstack/react-start"
import { authClient } from "@/lib/auth-client"

export const SessionMiddleware = createMiddleware().server(async ({ next, request }) => {
    const sessions = await authClient.getSession({
        fetchOptions: {
            headers: request.headers,
            throw: true
        }
    })
    if (!sessions) {
        throw new Error("Unauthorized")
    }
    return next({
        context: {
            sessions: sessions
        }
    })
})
