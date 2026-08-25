import { createMiddleware } from "@tanstack/react-start"
import { redirect } from "@tanstack/react-router"
import { auth } from "@/auth"

export const AdminMiddleware = createMiddleware().server(async ({ next, request }) => {
    const sessions = await auth.api.getSession({
        headers: request.headers,
    })
    if (!sessions) {
        throw redirect({
            to: "/sign-in",
            search: {
                reason: "session-expired",
            },
            replace: true,
        })
    }
    if (sessions.user.role !== "admin") {
        throw redirect({
            to: "/unauthorized",
            replace: true,
        })
    }
    return next({
        context: {
            sessions,
        },
    })
})
