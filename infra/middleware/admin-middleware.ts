import { createMiddleware } from "@tanstack/react-start"
import { isAdminTier } from "@/auth/utils/permissions"
import { auth } from "@/auth"

export const AdminMiddleware = createMiddleware().server(async ({ next, request }) => {
    const sessions = await auth.api.getSession({
        headers: request.headers,
    })
    if (!sessions || !isAdminTier(sessions.user.role ?? "")) {
        throw new Error("Forbidden")
    }
    return next({
        context: {
            sessions,
        },
    })
})
