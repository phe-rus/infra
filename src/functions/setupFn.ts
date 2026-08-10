import { createServerFn } from "@tanstack/react-start"
import { getMigrations } from "better-auth/db/migration"
import { APIError } from "better-auth/api"
import { auth } from "@/auth"
import { forwardAuthCookies } from "@/auth/forward-cookies"
import { z } from "zod"
import { setAppName } from "@/auth/settings/instance"
import { setSecuritySettings } from "@/auth/settings/security"
import { setEmailPasswordSettings } from "@/auth/settings/email-password"
import { setEnabledMethods } from "@/auth/settings/methods-store"
import { setCustomRoles } from "@/auth/settings/roles-store"

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

const completeSetupSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8).max(48),
    rememberMe: z.boolean().optional(),
    appName: z.string().min(1),
    security: z.object({
        useSecureCookies: z.boolean(),
        crossSubDomainCookies: z.boolean(),
        cookieDomain: z.string(),
    }),
    emailPassword: z.object({
        requireEmailVerification: z.boolean(),
    }),
    authMethods: z.record(z.string(), z.boolean()),
    customRoles: z.array(
        z.object({
            name: z.string().min(1),
            permissions: z.object({
                user: z.array(z.string()),
                session: z.array(z.string()),
            }),
            adminTier: z.boolean(),
        })
    ),
})

// Creates the owner account and persists every wizard setting in one
// server-side call. Deliberately does NOT go through the OwnerMiddleware-gated
// update* server functions for this — those require an existing owner
// session read back from the request's cookies, but whether that session
// exists yet depends on auth.api.signUpEmail's autoSignIn, which better-auth
// silently skips whenever requireEmailVerification is true. Bundling
// everything into one request sidesteps that session/cookie round-trip
// entirely, since this is a one-time bootstrap with no session to check.
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
            forwardAuthCookies(headers)
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }

        await Promise.all([
            setAppName(data.appName),
            setSecuritySettings(data.security),
            setEmailPasswordSettings(data.emailPassword),
            setEnabledMethods(data.authMethods),
            setCustomRoles(data.customRoles),
        ])

        return { error: null }
    })
