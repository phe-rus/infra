// Deliberately its own file with zero imports — this needs to be safely
// importable from client.ts (browser bundle) without dragging in index.ts's
// server-only dependencies (better-auth/api, sanitize-html via sanitize-svg).
//
// The CDN is mounted at /api/cdn on the api/ worker (see api/src/api.ts's
// apiRoute — a plain top-level route, not nested under /auth). cdnPath
// returns only that relative path, deliberately not baking in an origin: an
// earlier version stored the full ctx.context.baseURL-prefixed URL on
// e.g. user.image, which broke the moment the server became reachable at
// a different host than the one active at upload time (localhost vs a
// LAN/Tailscale IP vs a real domain) — confirmed live, a stored avatar
// URL pointed at a host that was no longer serving anything. A same-origin
// consumer (infra's own dashboard) can use this relative path directly as
// an <img src>; a cross-origin one (www) needs cdnUrl below to prefix it
// with whichever host it knows api/ is actually reachable at.
export function cdnPath(key: string, version: number): string {
    return `/api/cdn/${key}?v=${version}`
}

// path is assumed relative (as cdnPath always returns) unless it's already
// absolute — guards a cross-origin consumer (www) against double-prefixing
// a path that was for some reason already stored absolute
export function withOrigin(origin: string, path: string): string {
    return path.startsWith("http") ? path : `${origin}${path}`
}

export function cdnUrl(origin: string, key: string, version: number): string {
    return withOrigin(origin, cdnPath(key, version))
}
