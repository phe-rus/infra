// Deliberately its own file with zero imports — this needs to be safely
// importable from client.ts (browser bundle) without dragging in index.ts's
// server-only dependencies (better-auth/api, sanitize-html via sanitize-svg).
//
// The CDN is always mounted at /api/auth/cdn — better-auth's default
// basePath, never overridden in this app's auth config. cdnPath returns
// only that relative path, deliberately not baking in an origin: an
// earlier version stored the full ctx.context.baseURL-prefixed URL on
// e.g. user.image, which broke the moment the server became reachable at
// a different host than the one active at upload time (localhost vs a
// LAN/Tailscale IP vs a real domain) — confirmed live, a stored avatar
// URL pointed at a host that was no longer serving anything. A same-origin
// consumer (infra's own dashboard) can use this relative path directly as
// an <img src>; a cross-origin one (www) needs cdnUrl below to prefix it
// with whichever host it knows infra is actually reachable at.
export function cdnPath(key: string, version: number): string {
    return `/api/auth/cdn/${key}?v=${version}`
}

export function cdnUrl(origin: string, key: string, version: number): string {
    return `${origin}${cdnPath(key, version)}`
}
