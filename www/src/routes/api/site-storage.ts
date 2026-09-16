import { resolveCookiePolicy } from "@data/legal"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/site-storage")({
    server: {
        handlers: {
            GET: () => Response.json(resolveCookiePolicy()),
        },
    },
})
