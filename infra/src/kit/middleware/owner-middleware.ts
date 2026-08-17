import { createMiddleware } from "@tanstack/react-start"
import { isOwner } from "@/auth/utils/permissions"
import { auth } from "@/auth"

export const OwnerMiddleware = createMiddleware().server(async ({ next, request }) => {
    const sessions = await auth.api.getSession({
        headers: request.headers,
    })
    if (!sessions || !isOwner(sessions.user.role ?? "")) {
        throw new Error("Forbidden")
    }
    return next({
        context: {
            sessions,
        },
    })
})
