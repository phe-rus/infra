import { createMiddleware } from "@tanstack/react-start"
import { authClient } from "@/lib/auth-client"
import { redirect } from "@tanstack/react-router"

export const authMiddleware = createMiddleware()
    .server(async ({ request, next }) => {
        const { data: session } = await authClient.getSession({
            fetchOptions: {
                headers: request.headers,
            }
        })
        if (!session) {
            return redirect({
                to: '/sign-in'
            })
        }

        return next({
            context: {
                session: session
            }
        })
    })