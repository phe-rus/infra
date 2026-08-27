import { getMigrations } from "better-auth/db/migration"
import defineHandler from "../utils/defineHandler"
import { env } from "cloudflare:workers"
import { auth } from "../auth/auth"

export const migrateRoutes = defineHandler()
    .get("/", (c) => {
        return c.text("Migration endpoint\nSend POST request with 'x-migration-secret' header to run migrations")
    })
    .post("/", async (c) => {
        try {
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
        } catch (error) {
            return c.json(
                { error: error instanceof Error ? error.message : "Migration failed" },
                500,
            );
        }
    })
