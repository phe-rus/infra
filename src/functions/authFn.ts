import { AuthMiddleware } from "./protectionFn"
import { forwardAuthCookies } from "@/auth/forward-cookies"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { APIError } from "better-auth/api"
import { auth } from "@/auth"
import { z } from "zod"

const signInSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
    rememberMe: z.boolean().optional(),
})

export const getSession = createServerFn({ method: "GET" })
    .middleware([AuthMiddleware])
    .handler(({ context: { sessions } }) => sessions)

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
            forwardAuthCookies(headers)
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
        forwardAuthCookies(headers)
    })