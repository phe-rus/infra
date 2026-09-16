import { resolveLegalPage } from "@data/legal"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/terms-of-service")(
    {
        server: {
            handlers: {
                GET: () => {
                    const page = resolveLegalPage(
                        "terms-of-service"
                    )
                    if (!page) {
                        return new Response(null, {
                            status: 404,
                        })
                    }
                    return Response.json(page)
                },
            },
        },
    }
)
