import { createFileRoute } from "@tanstack/react-router"
import { routeTree } from "@/routeTree.gen"
import { z } from "zod"

const sitemapSchema = z.object({
    map: z.array(
        z.object({
            loc: z.string().url(),
            lastmod: z.date().optional(),
            changefreq: z.enum([
                "always",
                "hourly",
                "daily",
                "weekly",
                "monthly",
                "yearly",
                "never",
            ]),
            priority: z.number().min(0).max(1),
        })
    ),
})

type SitemapConfig = z.infer<typeof sitemapSchema>

function generateSitemap(config: SitemapConfig) {
    const blocks = config.map.map((rule) => {
        const lines = [
            `  <url>`,
            `    <loc>${rule.loc}</loc>`,
            `    <changefreq>${rule.changefreq}</changefreq>`,
            `    <priority>${rule.priority}</priority>`,
        ]
        if (rule.lastmod) {
            lines.push(`    <lastmod>${rule.lastmod.toISOString()}</lastmod>`)
        }
        lines.push(`  </url>`)
        return lines.join("\n")
    })
    return [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
        ...blocks,
        `</urlset>`,
    ].join("\n")
}

function normalizePath(path: string): string {
    if (path === "/") return "/"
    // Remove trailing slashes for canonical consistency
    return path.endsWith("/") ? path.slice(0, -1) : path
}

// biome-ignore lint/suspicious/noExplicitAny: collections
function collectStaticPaths(node: any, paths: Set<string> = new Set()): Set<string> {
    const fullPath: string | undefined = node.fullPath ?? node.path
    if (fullPath) {
        const normalized = normalizePath(fullPath)
        const isDynamic = normalized.includes("$") || normalized.includes("*")
        const isAssetOrMeta =
            normalized.endsWith(".xml") ||
            normalized.endsWith(".txt") ||
            normalized.endsWith(".json")
        const isApi = normalized.startsWith("/api")
        // Filter layout-only nodes: if a route has children but no index component,
        // skipping pure parent directories avoids phantom paths like `/legal`
        const isPureLayout = node.children && !node.component && !node.isRoot
        if (!isDynamic && !isAssetOrMeta && !isApi && !isPureLayout) {
            paths.add(normalized)
        }
    }
    if (node.children) {
        const children = Array.isArray(node.children)
            ? node.children
            : Object.values(node.children)
        for (const child of children) {
            collectStaticPaths(child, paths)
        }
    }
    return paths
}

export const Route = createFileRoute("/(seo)/sitemap.xml")({
    server: {
        handlers: {
            GET: ({ request }) => {
                const origin = new URL(request.url).origin
                const staticPaths = Array.from(collectStaticPaths(routeTree))
                const map = staticPaths.map((path) => {
                    const fullUrl = new URL(path, origin).toString()
                    const isHome = path === "/"

                    return {
                        loc: fullUrl,
                        lastmod: new Date(),
                        changefreq: isHome ? ("daily" as const) : ("weekly" as const),
                        priority: isHome ? 1.0 : 0.8,
                    }
                })
                const data = sitemapSchema.parse({ map })
                return new Response(generateSitemap(data), {
                    headers: {
                        "Content-Type": "text/xml",
                        "Cache-Control": "public, max-age=86400, s-maxage=86400",
                    },
                })
            },
        },
    },
})