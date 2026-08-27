import { getMigrations } from "better-auth/db/migration"
import defineHandler from "../utils/defineHandler"
import { env } from "cloudflare:workers"
import { auth } from "../auth/auth"

export const migrateRoutes = defineHandler()
    .post("/", async (c) => {
        if (c.req.header("x-migration-secret") !== env.MIGRATION_SECRET) {
            return c.text("Forbidden", 403)
        }
        const { toBeCreated, toBeAdded, runMigrations } =
            await getMigrations(auth.options)
        if (toBeCreated.length === 0 && toBeAdded.length === 0) {
            return c.json({ message: "No migrations needed" })
        }
        await runMigrations()
        return c.json({
            message: "Migrations completed successfully",
            created: toBeCreated.map((t) => t.table),
            added: toBeAdded.map((t) => t.table),
        })
    })
