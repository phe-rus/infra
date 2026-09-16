import { resolveLicense } from "@data/licenses"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/mit-license")({
    server: {
        handlers: {
            GET: () => {
                const license = resolveLicense("mit-license")
                if (!license) {
                    return new Response(null, { status: 404 })
                }
                return Response.json(license)
            },
        },
    },
})
