import { withEdgeCache, type EdgeCacheContext } from "./edge-cache"

export type RemotePattern = {
    protocol?: "http" | "https"
    // a leading "*." is stripped and matched the same way as the bare
    // hostname — both the exact domain and any subdomain are allowed,
    // mirroring infra/src/auth/utils/trusted-origins.ts's isTrustedOrigin
    // rather than inventing new matching semantics
    hostname: string
    port?: string
    // "*"/"**" only supported as a trailing wildcard (prefix match) — not a
    // full glob engine, deliberately coarser than next/image's own
    // segment-aware pathname matching
    pathname?: string
    search?: string
}

export type ImageProxyOptions = {
    // local mount path this proxy answers on, e.g. "/_image"
    path: string
    // deprecated shorthand — exact "https://host" strings. Prefer
    // remotePatterns; kept so existing callers don't have to migrate
    allowedOrigins?: string[]
    remotePatterns?: RemotePattern[]
    maximumRedirects?: number
    maximumResponseBody?: number
    minimumCacheTTL?: number
    dangerouslyAllowSVG?: boolean
    contentDispositionType?: "attachment" | "inline"
    contentSecurityPolicy?: string
}

const DEFAULT_MAX_REDIRECTS = 3
const DEFAULT_MAX_RESPONSE_BODY = 20_000_000
const DEFAULT_MIN_CACHE_TTL = 14400
const DEFAULT_CSP = "default-src 'self'; script-src 'none'; sandbox;"

function matchesPathname(actual: string, pattern?: string): boolean {
    if (!pattern) return true
    const starIndex = pattern.indexOf("*")
    if (starIndex === -1) return actual === pattern
    return actual.startsWith(pattern.slice(0, starIndex))
}

function matchesRemotePattern(
    url: URL,
    pattern: RemotePattern
): boolean {
    if (pattern.protocol && url.protocol !== `${pattern.protocol}:`)
        return false
    if (pattern.port !== undefined && url.port !== pattern.port)
        return false
    const hostname = pattern.hostname.startsWith("*.")
        ? pattern.hostname.slice(2)
        : pattern.hostname
    const hostMatches =
        url.hostname === hostname ||
        url.hostname.endsWith(`.${hostname}`)
    if (!hostMatches) return false
    if (!matchesPathname(url.pathname, pattern.pathname)) return false
    if (pattern.search !== undefined && url.search !== pattern.search)
        return false
    return true
}

function isAllowedTarget(
    url: URL,
    options: ImageProxyOptions
): boolean {
    if (
        options.remotePatterns?.some((pattern) =>
            matchesRemotePattern(url, pattern)
        )
    )
        return true
    if (options.allowedOrigins?.includes(url.origin)) return true
    return false
}

async function fetchWithRedirectCap(
    url: URL,
    maxRedirects: number
): Promise<Response> {
    let current = url
    let hops = 0
    for (;;) {
        const res = await fetch(current, { redirect: "manual" })
        const isRedirect = res.status >= 300 && res.status < 400
        if (!isRedirect) return res
        if (hops >= maxRedirects)
            return new Response(null, { status: 400 })
        const location = res.headers.get("location")
        if (!location) return res
        current = new URL(location, current)
        hops += 1
    }
}

function exceedsMaxBody(res: Response, max: number): boolean {
    const contentLength = res.headers.get("content-length")
    return contentLength !== null && Number(contentLength) > max
}

function withCacheTTL(
    res: Response,
    minimumCacheTTL: number
): Response {
    const headers = new Headers(res.headers)
    const existingMaxAge = Number(
        headers.get("cache-control")?.match(/max-age=(\d+)/)?.[1] ?? 0
    )
    headers.set(
        "cache-control",
        `public, max-age=${Math.max(minimumCacheTTL, existingMaxAge)}`
    )
    return new Response(res.body, { status: res.status, headers })
}

// Returns null when SVG content is fetched but not allowed — the caller
// turns that into a 400. When allowed, the safety headers (Content-
// Disposition, CSP) are applied unconditionally, not just gated by the flag
function guardSvg(
    res: Response,
    options: ImageProxyOptions
): Response | null {
    const contentType = res.headers.get("content-type") ?? ""
    if (!contentType.includes("image/svg+xml")) return res
    if (!options.dangerouslyAllowSVG) return null

    const headers = new Headers(res.headers)
    headers.set(
        "content-disposition",
        options.contentDispositionType ?? "attachment"
    )
    headers.set(
        "content-security-policy",
        options.contentSecurityPolicy ?? DEFAULT_CSP
    )
    return new Response(res.body, { status: res.status, headers })
}

// Returns null for any request this proxy doesn't own, so a caller's own
// server.ts can treat that as "not handled, fall through to the normal path"
export function createImageProxy(options: ImageProxyOptions) {
    return async function handleImageProxy(
        request: Request,
        ctx: EdgeCacheContext
    ): Promise<Response | null> {
        const url = new URL(request.url)
        if (request.method !== "GET" || url.pathname !== options.path)
            return null

        const target = url.searchParams.get("url")
        if (!target) return new Response(null, { status: 400 })

        let targetUrl: URL
        try {
            targetUrl = new URL(target)
        } catch {
            return new Response(null, { status: 400 })
        }
        if (!isAllowedTarget(targetUrl, options)) {
            return new Response(null, { status: 403 })
        }

        return withEdgeCache(request, ctx, async () => {
            const maxRedirects =
                options.maximumRedirects ?? DEFAULT_MAX_REDIRECTS
            const maxBody =
                options.maximumResponseBody ?? DEFAULT_MAX_RESPONSE_BODY
            const minTTL =
                options.minimumCacheTTL ?? DEFAULT_MIN_CACHE_TTL

            const fetched = await fetchWithRedirectCap(
                targetUrl,
                maxRedirects
            )
            if (fetched.status !== 200) return fetched
            if (exceedsMaxBody(fetched, maxBody))
                return new Response(null, { status: 413 })

            const svgChecked = guardSvg(fetched, options)
            if (svgChecked === null)
                return new Response(null, { status: 400 })

            return withCacheTTL(svgChecked, minTTL)
        })
    }
}
