import { createMiddleware } from "@tanstack/react-start"
import { auth } from "@/auth"

// any authenticated user, no role/tier check — for OAuth end-user flows
// (consent, etc.) that a plain `user` role must be able to reach, unlike
// everything gated by AdminMiddleware/OwnerMiddleware
export const SessionMiddleware = createMiddleware().server(async ({ next, request }) => {
    const sessions = await auth.api.getSession({
        headers: request.headers,
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
