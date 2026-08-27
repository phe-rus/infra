import { createFileRoute } from "@tanstack/react-router"
import { env } from "cloudflare:workers"

export const Route = createFileRoute("/api/cdn/$")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const url = new URL(request.url)
                const key = url.pathname.replace(/^\/api\/cdn\//, "")
                const object = await env.R2.get(key)
                if (!object) {
                    return new Response(null, { status: 404 })
                }
                return new Response(object.body, {
                    status: 200,
                    headers: {
                        "Content-Type":
                            object.httpMetadata?.contentType ??
                            "application/octet-stream",
                        ...(object.httpEtag
                            ? { ETag: object.httpEtag }
                            : {}),
                        "Cache-Control":
                            "public, max-age=31536000, stale-while-revalidate=60",
                        "X-Content-Type-Options": "nosniff",
                    },
                })
            },
        },
    },
})
