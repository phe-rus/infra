import { env } from "cloudflare:workers"
import { createFileRoute } from "@tanstack/react-router"
import { getMigrations } from "better-auth/db/migration"
import { auth } from "@/auth"

export const Route = createFileRoute("/api/migrate")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                if (request.headers.get("x-migration-secret") !== env.MIGRATION_SECRET) {
                    return new Response("Forbidden", {
                        status: 403
                    })
                }

                const {
                    toBeCreated,
                    toBeAdded,
                    runMigrations
                } = await getMigrations(auth.options)
                if (toBeCreated.length === 0 && toBeAdded.length === 0) {
                    return Response.json({
                        message: "No migrations needed"
                    })
                }

                await runMigrations()
                return Response.json({
                    message: "Migrations completed successfully",
                    created: toBeCreated.map((t) => t.table),
                    added: toBeAdded.map((t) => t.table),
                })
            }
        }
    }
})
