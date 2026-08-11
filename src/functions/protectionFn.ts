import { createMiddleware } from "@tanstack/react-start"
import { auth } from "@/auth"

export const AuthMiddleware = createMiddleware()
    .server(async ({ next, request }) => {
        const sessions = await auth.api.getSession({
            headers: request.headers,
        })
        return next({
            context: {
                sessions,
            },
        })
    })

export const OwnerMiddleware = createMiddleware()
    .server(async ({ next, request }) => {
        const sessions = await auth.api.getSession({
            headers: request.headers
        })
        if (!sessions || sessions.user.role !== "owner") {
            throw new Error("Forbidden")
        }
        return next({
            context: {
                sessions,
            },
        })
    })

export const AdminMiddleware = createMiddleware()
    .server(async ({ next, request }) => {
        const sessions = await auth.api.getSession({
            headers: request.headers
        })
        if (!sessions || (sessions.user.role !== "owner" && sessions.user.role !== "admin")) {
            throw new Error("Forbidden")
        }
        return next({
            context: {
                sessions
            }
        })
    })
