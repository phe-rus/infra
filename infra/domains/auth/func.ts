import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { APIError } from "better-auth/api"
import { env } from "cloudflare:workers"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/lib/forward-headers"
import { forgotPasswordSchema, resetPasswordSchema, signInSchema } from "./types"
import { AdminMiddleware } from "@/middleware"

export const getSession = createServerFn({
    method: "GET",
}).handler(async () => {
    try {
        const headers = getRequestHeaders()
        return await auth.api.getSession({ headers })
    } catch {
        return null
    }
})

export const protectedSession = createServerFn({
    method: "GET",
})
    .middleware([AdminMiddleware])
    .handler(async ({ context }) => {
        return context.sessions
    })

export const signIn = createServerFn({ method: "POST" })
    .validator(signInSchema)
    .handler(async ({ data }) => {
        try {
            const headers = getRequestHeaders()
            const ctx = await auth.api.signInEmail({
                body: data,
                headers: headers,
                returnHeaders: true,
            })
            forwardAuthHeaders(ctx.headers)
            const redirectUri = (
                ctx.response as
                    | {
                          redirect_uri?: string
                      }
                    | undefined
            )?.redirect_uri
            return {
                error: null,
                redirectUri: redirectUri ?? null,
            }
        } catch (error) {
            if (error instanceof APIError)
                return {
                    error: error.message,
                    redirectUri: null,
                }
            throw error
        }
    })

export const signOut = createServerFn({
    method: "POST",
}).handler(async () => {
    const headers = getRequestHeaders()
    const { headers: responseHeaders } = await auth.api.signOut({
        headers,
        returnHeaders: true,
    })
    forwardAuthHeaders(responseHeaders)
})

export const requestPasswordReset = createServerFn({
    method: "POST",
})
    .validator(forgotPasswordSchema)
    .handler(async ({ data }) => {
        await auth.api.requestPasswordReset({
            body: {
                email: data.email,
                redirectTo: `${env.BETTER_AUTH_URL}/reset-password`,
            },
        })
        return {
            message: "If this email exists, check your inbox for a reset link",
        }
    })

export const resetPassword = createServerFn({
    method: "POST",
})
    .validator(resetPasswordSchema)
    .handler(async ({ data }) => {
        try {
            await auth.api.resetPassword({
                body: {
                    newPassword: data.newPassword,
                    token: data.token,
                },
            })
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }
    })

