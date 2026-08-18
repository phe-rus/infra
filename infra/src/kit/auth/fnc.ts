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
} from "./schema"

// Non-throwing on purpose: runs on every route including /sign-in and
// /setup, which handle the no-session case themselves. A throwing
// middleware here redirect-loops a fresh instance between the two. The
// try/catch also covers a fresh instance with no migrations run yet, where
// the session table doesn't exist at all rather than just being empty.
export const getSession = createServerFn({ method: "GET" }).handler(async () => {
    try {
        const headers = getRequestHeaders()
        return await auth.api.getSession({ headers })
    } catch {
        return null
    }
})

export const getSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
    try {
        const ctx = await auth.$context
        const count = await ctx.adapter.count({ model: "user" })
        return { hasOwner: count > 0 }
    } catch {
        return { hasOwner: false }
    }
})

export const signIn = createServerFn({ method: "POST" })
    .validator(signInSchema)
    .handler(async ({ data }) => {
        try {
            const headers = getRequestHeaders()
            const { response, headers: responseHeaders } = await auth.api.signInEmail({
                body: {
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe,
                    ...(data.oauthQuery && {
                        oauth_query: data.oauthQuery,
                    }),
                },
                headers: headers,
                returnHeaders: true,
            })
            forwardAuthHeaders(responseHeaders)
            const redirectUri = (response as { redirect_uri?: string } | undefined)?.redirect_uri
            return { error: null, redirectUri: redirectUri ?? null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message, redirectUri: null }
            throw error
        }
    })

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
    const headers = getRequestHeaders()
    const { headers: responseHeaders } = await auth.api.signOut({
        headers,
        returnHeaders: true,
    })
    forwardAuthHeaders(responseHeaders)
})

// requestPasswordReset's own url (sent in the email) points at better-auth's
// own /reset-password/:token callback, which validates the token then
// redirects the browser here with ?token= appended — this is just what
// kicks that off, no cookies/response headers involved
export const requestPasswordReset = createServerFn({ method: "POST" })
    .validator(forgotPasswordSchema)
    .handler(async ({ data }) => {
        await auth.api.requestPasswordReset({
            body: {
                email: data.email,
                redirectTo: `${env.BETTER_AUTH_URL}/reset-password`,
            },
        })
        // deliberately the same response whether or not the email exists —
        // better-auth's own endpoint already does this to avoid leaking
        // account existence, matched here rather than undone by branching
        return { message: "If this email exists, check your inbox for a reset link" }
    })

export const resetPassword = createServerFn({ method: "POST" })
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

export const completeSetup = createServerFn({ method: "POST" })
    .validator(completeSetupSchema)
    .handler(async ({ data }) => {
        try {
            const headers = getRequestHeaders()
            const { response: signUpResponse } = await auth.api.signUpEmail({
                body: {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe,
                },
                headers: headers,
                returnHeaders: true,
            })

            // requireEmailVerification exists to protect OAuth end-user
            // signups (/create-account), not to gate the one account that
            // has to sign in before anything else on a fresh instance can
            // happen — signUpEmail withholds the session for every signup
            // uniformly when it's on, with no per-call override, so the
            // owner is verified directly here, then signed in for real
            const ctx = await auth.$context
            await ctx.adapter.update({
                model: "user",
                where: [{ field: "id", value: signUpResponse.user.id }],
                update: { emailVerified: true },
            })

            const { headers: responseHeaders } = await auth.api.signInEmail({
                body: {
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe,
                },
                headers: headers,
                returnHeaders: true,
            })
            forwardAuthHeaders(responseHeaders)
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }
    })

export const runSetupMigrations = createServerFn({ method: "POST" }).handler(async () => {
    const ctx = await auth.$context
    const count = await ctx.adapter.count({ model: "user" }).catch(() => 0)
    if (count > 0) {
        throw new Error("Setup is already complete: this instance already has an owner account.")
    }

    const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options)
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
