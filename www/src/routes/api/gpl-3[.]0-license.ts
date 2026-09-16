import { resolveLicense } from "@data/licenses"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/gpl-3.0-license")({
    server: {
        handlers: {
            GET: () => {
                const license = resolveLicense(
                    "gpl-3.0-license"
                )
                if (!license) {
                    return new Response(null, { status: 404 })
                }
                return Response.json(license)
            },
        },
    },
})
