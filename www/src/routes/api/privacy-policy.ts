import { resolveLegalPage } from "@data/legal"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/privacy-policy")({
    server: {
        handlers: {
            GET: () => {
                const page = resolveLegalPage(
                    "privacy-policy"
                )
                if (!page) {
                    return new Response(null, { status: 404 })
                }
                return Response.json(page)
            },
        },
    },
})
