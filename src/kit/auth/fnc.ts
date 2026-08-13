import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { getMigrations } from "better-auth/db/migration"
import { APIError } from "better-auth/api"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { completeSetupSchema, signInSchema } from "@/kit/schemas"

// Non-throwing on purpose: runs on every route including /sign-in and
// /setup, which handle the no-session case themselves. A throwing
// middleware here redirect-loops a fresh instance between the two.
export const getSession = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders()
    return await auth.api.getSession({ headers })
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
            const { headers } = await auth.api.signInEmail({
                body: data,
                returnHeaders: true,
            })
            forwardAuthHeaders(headers)
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
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

export const completeSetup = createServerFn({ method: "POST" })
    .validator(completeSetupSchema)
    .handler(async ({ data }) => {
        try {
            const { headers } = await auth.api.signUpEmail({
                body: {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe,
                },
                returnHeaders: true,
            })
            forwardAuthHeaders(headers)
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
