import { resolveCookiePolicy } from "@data/legal"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/cookie-policy")({
    server: {
        handlers: {
            GET: () => Response.json(resolveCookiePolicy()),
        },
    },
})
