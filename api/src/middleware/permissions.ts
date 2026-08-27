import { createMiddleware } from "hono/factory"
import type { AppTypes } from "../types"
import { auth } from "../auth"

export const currentSession = createMiddleware<AppTypes>(
    async (c, next) => {
        const session = await auth.api.getSession({
            headers: c.req.raw.headers,
        })

        if (!session) {
            c.set("user", null)
            c.set("session", null)
            await next()
            return
        }

        c.set("user", session.user)
        c.set("session", session.session)
        await next()
    }
)

export const protectedSession = createMiddleware<AppTypes>(
    async (c, next) => {
        const session = await auth.api.getSession({
            headers: c.req.raw.headers,
        })
        if (!session) return c.text("Not authenticated", 401)
        c.set("user", session.user)
        c.set("session", session.session)
        await next()
    }
)

export const adminSession = createMiddleware<AppTypes>(
    async (c, next) => {
        const user = c.get('user')
        if (!user) return c.text("Not authenticated", 401)
        if (user.role !== 'admin') return c.text("Unauthorized", 401)
        await next()
    }
)
