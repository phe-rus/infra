import { forwardAuthHeaders } from "@/auth/forward-headers"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { APIError } from "better-auth/api"
import { auth } from "@/auth"
import { signInSchema } from "@/schemas/auth"

// Deliberately does not use AuthMiddleware: this is root's own generic
// "is there a session" check, run on every single route including
// /sign-in and /setup, which exist specifically to handle the no-session
// case. AuthMiddleware throws a redirect when there's no session, which
// is exactly right for a protected server function, but wrong here, it
// would fire before _auth's own routes ever got a chance to decide what
// "no session" should mean for them, this is what caused a genuinely
// fresh instance (no owner yet) to redirect-loop between /setup and
// /sign-in, neither route's own logic ever ran. This returns null
// gracefully instead, every consumer decides for itself what to do.
export const getSession = createServerFn({ method: "GET" })
    .handler(async () => {
        const headers = getRequestHeaders()
        return await auth.api.getSession({ headers })
    })

export const getSetupStatus = createServerFn({ method: "GET" })
    .handler(async () => {
        try {
            const ctx = await auth.$context
            const count = await ctx.adapter.count({ model: "user" })
            return { hasOwner: count > 0 }
        } catch (error) {
            return { hasOwner: false }
        }
    })

export const signInEmail = createServerFn({ method: "POST" })
    .validator(signInSchema)
    .handler(async ({ data }) => {
        try {
            const { headers } = await auth.api.signInEmail({
                body: data,
                returnHeaders: true
            })
            forwardAuthHeaders(headers)
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }
    })

export const signOutUser = createServerFn({ method: "POST" })
    .handler(async () => {
        const requestHeaders = getRequestHeaders()
        const { headers } = await auth.api.signOut({
            headers: requestHeaders,
            returnHeaders: true
        })
        forwardAuthHeaders(headers)
    })