import {
    SITEMAP_XML_HEADERS,
    buildSitemapEntries,
    generateSitemap,
} from "@lib/sitemap"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/(seo)/sitemap.xml")({
    server: {
        handlers: {
            GET: ({ request }) => {
                const origin = new URL(request.url).origin
                const entries = buildSitemapEntries(origin)
                return new Response(
                    generateSitemap(entries),
                    { headers: SITEMAP_XML_HEADERS }
                )
            },
        },
    },
})
