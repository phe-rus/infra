import {
    baseLocale,
    extractLocaleFromUrl,
    generateStaticLocalizedUrls,
} from "@/paraglide/runtime"
import { routeTree } from "@/routeTree.gen"

export function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
}

function normalizePath(path: string): string {
    if (path === "/") return "/"
    return path.endsWith("/") ? path.slice(0, -1) : path
}

function collectStaticPaths(
    // biome-ignore lint/suspicious/noExplicitAny: router tree inspection
    node: any,
    paths: Set<string> = new Set()
): Set<string> {
    if (!node) return paths

    const fullPath: string | undefined =
        node.fullPath ?? node.path

    if (fullPath) {
        const normalized = normalizePath(fullPath)
        const isDynamic =
            normalized.includes("$") ||
            normalized.includes("*")
        const isAssetOrMeta =
            normalized.endsWith(".xml") ||
            normalized.endsWith(".txt") ||
            normalized.endsWith(".json") ||
            normalized.endsWith(".webmanifest")
        const isApi = normalized.startsWith("/api")
        // Filter layout-only nodes: if a route has children but no index component,
        // skipping pure parent directories avoids phantom paths like `/legal`
        const isPureLayout =
            node.children && !node.component && !node.isRoot

        if (
            !isDynamic &&
            !isAssetOrMeta &&
            !isApi &&
            !isPureLayout
        ) {
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

export function getStaticPaths(): string[] {
    return Array.from(collectStaticPaths(routeTree))
}

type ChangeFreq =
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never"

type SitemapAlternate = {
    hreflang: string
    href: string
}

type SitemapEntry = {
    loc: string
    changefreq: ChangeFreq
    priority: number
    lastmod?: Date
    alternates: SitemapAlternate[]
}

export function buildSitemapEntries(
    origin: string
): SitemapEntry[] {
    const now = new Date()

    return getStaticPaths().flatMap((path) => {
        const isHome = path === "/"
        const localizedUrls = generateStaticLocalizedUrls([
            path,
        ])

        const byLocale = localizedUrls.map((url) => ({
            locale: extractLocaleFromUrl(url) ?? baseLocale,
            href: new URL(
                url.pathname + url.search,
                origin
            ).toString(),
        }))

        const defaultHref =
            byLocale.find(
                (entry) => entry.locale === baseLocale
            )?.href ?? byLocale[0]?.href

        const alternates: SitemapAlternate[] = [
            ...byLocale.map((entry) => ({
                hreflang: entry.locale,
                href: entry.href,
            })),
            ...(defaultHref
                ? [
                      {
                          hreflang: "x-default",
                          href: defaultHref,
                      },
                  ]
                : []),
        ]

        return byLocale.map((entry) => ({
            loc: entry.href,
            changefreq: isHome
                ? ("daily" as const)
                : ("weekly" as const),
            priority: isHome ? 1.0 : 0.8,
            lastmod: now,
            alternates,
        }))
    })
}

export function generateSitemap(
    entries: SitemapEntry[]
): string {
    const blocks = entries.map((entry) => {
        const lines = [
            "  <url>",
            `    <loc>${escapeXml(entry.loc)}</loc>`,
        ]

        for (const alt of entry.alternates) {
            lines.push(
                `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}" />`
            )
        }

        lines.push(
            `    <changefreq>${entry.changefreq}</changefreq>`
        )
        lines.push(
            `    <priority>${entry.priority.toFixed(1)}</priority>`
        )

        if (entry.lastmod) {
            lines.push(
                `    <lastmod>${entry.lastmod.toISOString()}</lastmod>`
            )
        }

        lines.push("  </url>")
        return lines.join("\n")
    })

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ...blocks,
        "</urlset>",
    ].join("\n")
}

export const SITEMAP_XML_HEADERS = {
    "Content-Type": "text/xml; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=86400, s-maxage=86400",
}
