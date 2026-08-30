import { getRequestHeaders } from "@tanstack/react-start/server"
import { createServerFn } from "@tanstack/react-start"
import { APIError } from "better-auth/api"
import { env } from "cloudflare:workers"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/lib/forward-headers"
import { AdminMiddleware, SessionMiddleware } from "@/middleware"
import {
    forgotPasswordSchema,
    resetPasswordSchema,
    setupSchema,
    signInSchema,
} from "./types"
import { getServerURL } from "@/lib/getURL"

function headers() {
    return Object.fromEntries(Object.entries(getRequestHeaders()))
}

export const getSession = createServerFn({ method: "GET" })
    .middleware([SessionMiddleware])
    .handler(async ({ context }) => {
        return context.sessions
    })

export const protectedSession = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async ({ context }) => {
        return context.sessions
    })

export const getFirstUserStatus = createServerFn({ method: "GET" })
    .handler(
        async () => {
            try {
                const ctx = await auth.$context
                const count = await ctx.adapter.count({ model: "user" })
                return { hasAdmin: count > 0 }
            } catch {
                return { hasAdmin: false }
            }
        }
    )

export const signIn = createServerFn({ method: "POST" })
    .validator(signInSchema)
    .handler(async ({ data }) => {
        try {
            const ctx = await auth.api.signInEmail({
                body: {
                    ...data,
                    callbackURL: getServerURL()
                },
                headers: headers(),
                returnHeaders: true,
            })
            forwardAuthHeaders(ctx.headers)
            const redirectUri = ctx.response?.redirect ? (ctx.response.url ?? null) : null
            return {
                error: null,
                code: null,
                redirectUri
            }
        } catch (error) {
            if (error instanceof APIError) {
                const code = (error.body as { code?: string } | undefined)?.code
                return { error: error.message, code: code ?? null, redirectUri: null }
            }
            throw error
        }
    })

export const signOut = createServerFn({ method: "POST" })
    .handler(
        async () => {
            const { headers: responseHeaders } = await auth.api.signOut({
                headers: headers(),
                returnHeaders: true,
            })
            forwardAuthHeaders(responseHeaders)
        }
    )

export const requestPasswordReset = createServerFn({ method: "POST" })
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

export const resetPassword = createServerFn({ method: "POST" })
    .validator(resetPasswordSchema)
    .handler(async ({ data }) => {
        try {
            await auth.api.resetPassword({
                body: { newPassword: data.newPassword, token: data.token },
            })
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }
    })

export const completeSetup = createServerFn({ method: "POST" })
    .validator(setupSchema)
    .handler(async ({ data }) => {
        try {
            const ctx = await auth.api.signUpEmail({
                body: {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe,
                    callbackURL: getServerURL()
                },
                headers: headers(),
                returnHeaders: true,
            })
            forwardAuthHeaders(ctx.headers)
            const response = ctx.response as { token?: string | null } | undefined
            return { error: null, needsVerification: !response?.token }
        } catch (error) {
            if (error instanceof APIError) {
                return { error: error.message, needsVerification: false }
            }
            throw error
        }
    })

export const resendVerificationEmail = createServerFn({ method: "POST" })
    .validator(({ email }: { email: string }) => ({ email }))
    .handler(async ({ data }) => {
        try {
            await auth.api.sendVerificationEmail({
                body: {
                    email: data.email,
                    callbackURL: getServerURL(),
                },
            })
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }
    })
