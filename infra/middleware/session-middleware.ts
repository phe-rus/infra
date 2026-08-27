import { createMiddleware } from "@tanstack/react-start"
import { authClient } from "@/lib/auth-client"

export const SessionMiddleware = createMiddleware().server(async ({ next, request }) => {
    const { data: sessions } = await authClient.getSession({
        fetchOptions: { headers: request.headers },
    })
    if (!sessions) {
        throw new Error("Unauthorized")
    }
    return next({
        context: {
            sessions,
        },
    })
})
