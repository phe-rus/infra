// Deliberately its own file with zero imports — this needs to be safely
// importable from client.ts (browser bundle) without dragging in index.ts's
// server-only dependencies (better-auth/api, sanitize-html via sanitize-svg).
//
// ctx.context.baseURL already resolves to the full mounted base including
// the basePath (e.g. http://localhost:3000/api/auth), not just the origin —
// confirmed live (an earlier version of this appended /api/auth a second
// time here, producing a doubled path)
export function cdnUrl(baseURL: string, key: string, version: number): string {
    return `${baseURL}/cdn/${key}?v=${version}`
}
