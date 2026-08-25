import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { getMigrations } from "better-auth/db/migration"
import { APIError } from "better-auth/api"
import { env } from "cloudflare:workers"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/lib/forward-headers"
import {
    completeSetupSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    signInSchema,
} from "./types"
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

export const getSetupStatus = createServerFn({
    method: "GET",
}).handler(async () => {
    try {
        const ctx = await auth.$context
        const count = await ctx.adapter.count({
            model: "user",
        })
        return { hasAdmin: count > 0 }
    } catch {
        return { hasAdmin: false }
    }
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

export const completeSetup = createServerFn({
    method: "POST",
})
    .validator(completeSetupSchema)
    .handler(async ({ data }) => {
        try {
            const headers = getRequestHeaders()
            await auth.api.signUpEmail({
                body: {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe,
                },
                headers: headers,
            })
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }
    })

export const runSetupMigrations = createServerFn({
    method: "POST",
}).handler(async () => {
    const ctx = await auth.$context
    const count = await ctx.adapter.count({ model: "user" }).catch(() => 0)
    if (count > 0) {
        throw new Error(
            "Setup is already complete: this instance already has an admin account."
        )
    }

    const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(
        auth.options
    )
    if (toBeCreated.length === 0 && toBeAdded.length === 0) {
        return { message: "No migrations needed" }
    }

    await runMigrations()
    return {
        message: "Migrations completed successfully",
        created: toBeCreated.map((t) => t.table),
        added: toBeAdded.map((t) => t.table),
    }
})
