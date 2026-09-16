import { resolveLicense } from "@data/licenses"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/pherus-license")({
    server: {
        handlers: {
            GET: () => {
                const license = resolveLicense(
                    "pherus-license"
                )
                if (!license) {
                    return new Response(null, { status: 404 })
                }
                return Response.json(license)
            },
        },
    },
})
