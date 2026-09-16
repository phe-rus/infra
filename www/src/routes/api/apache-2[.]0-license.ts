import { resolveLicense } from "@data/licenses"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
    "/api/apache-2.0-license"
)({
    server: {
        handlers: {
            GET: () => {
                const license = resolveLicense(
                    "apache-2.0-license"
                )
                if (!license) {
                    return new Response(null, { status: 404 })
                }
                return Response.json(license)
            },
        },
    },
})
