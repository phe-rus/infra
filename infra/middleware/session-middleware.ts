import { createMiddleware } from "@tanstack/react-start"
import { auth } from "@/auth"

export const SessionMiddleware = createMiddleware()
    .server(async ({ next, request }) => {
        const sessions = await auth.api.getSession({
            headers: request.headers,
        })
        return next({
            context: {
                sessions: sessions
            }
        })
    })
