import { createServerFn } from "@tanstack/react-start"
import { getMigrations } from "better-auth/db/migration"
import { APIError } from "better-auth/api"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { completeSetupSchema } from "@/schemas/setup"

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

// Just creates the owner account. App name, security, email verification,
// and sign-in methods are now static constants in src/auth/index.ts; only
// custom roles/instance access stay editable afterward, from the
// dashboard's Team & roles page, so none of it needs to be collected here.
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
