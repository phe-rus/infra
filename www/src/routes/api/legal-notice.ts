import { resolveLegalPage } from "@data/legal"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/legal-notice")({
    server: {
        handlers: {
            GET: () => {
                const page = resolveLegalPage("legal-notice")
                if (!page) {
                    return new Response(null, { status: 404 })
                }
                return Response.json(page)
            },
        },
    },
})
