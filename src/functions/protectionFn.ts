import { createMiddleware } from "@tanstack/react-start"
import { auth } from "@/auth"

export const RequestMiddleware = createMiddleware()
    .server(({ request, next }) => {
        return next({
            context: {
                request,
            },
        })
    })

export const AuthMiddleware = createMiddleware()
    .server(async ({ request, next }) => {
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
    .server(async ({ request, next }) => {
        const sessions = await auth.api.getSession({ headers: request.headers })
        if (!sessions || sessions.user.role !== "owner") {
            throw new Error("Forbidden")
        }
        return next({
            context: {
                sessions,
                headers: request.headers,
            },
        })
    })

// owner has every admin privilege too, so this simply widens OwnerMiddleware
// to also let the admin role through.
export const AdminMiddleware = createMiddleware()
    .server(async ({ request, next }) => {
        const sessions = await auth.api.getSession({ headers: request.headers })
        if (!sessions || (sessions.user.role !== "owner" && sessions.user.role !== "admin")) {
            throw new Error("Forbidden")
        }
        return next({
            context: {
                sessions,
                headers: request.headers,
            },
        })
    })
