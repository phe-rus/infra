import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { APIError } from "better-auth/api"
import { auth } from "@/auth"
import { AuthMiddleware, RequestMiddleware } from "./protectionFn"
import { queryOptions } from "@tanstack/react-query"

export const getSession = createServerFn({ method: "GET" })
    .middleware([AuthMiddleware])
    .handler(({ context: { sessions } }) => sessions)

export const getSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
    try {
        const ctx = await auth.$context
        const count = await ctx.adapter.count({ model: "user" })
        return { hasOwner: count > 0 }
    } catch {
        // Table doesn't exist yet (migrations haven't run on this DB) — that's
        // just as "no owner yet" as an empty table, so route to setup either way.
        return { hasOwner: false }
    }
})

const signInSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
})

export const signInEmail = createServerFn({ method: "POST" })
    .validator(signInSchema)
    .handler(async ({ data }) => {
        try {
            await auth.api.signInEmail({ body: data })
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }
    })

const setupSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
})

export const setupOwner = createServerFn({ method: "POST" })
    .validator(setupSchema)
    .handler(async ({ data }) => {
        try {
            await auth.api.signUpEmail({ body: data })
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }
    })

export const signOutUser = createServerFn({ method: "POST" })
    .middleware([RequestMiddleware])
    .handler(async ({ context: { request } }) => {
        await auth.api.signOut({ headers: request.headers })
    })

export const currentUserQueryOptions = () =>
    queryOptions({
        queryKey: ['currentUser'],
        queryFn: () => getSession(),
    })
