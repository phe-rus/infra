import { createServerFn } from "@tanstack/react-start"
import { getMigrations } from "better-auth/db/migration"
import { auth } from "@/auth"

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
