import { setResponseHeaders } from "@tanstack/react-start/server"

// auth.api.* calls made with `returnHeaders: true` return every header
// better-auth wants the caller to propagate, not just Set-Cookie (session
// rotation, etc). Forward the whole thing instead of hand-parsing cookies.
export function forwardAuthHeaders(headers: Headers | undefined) {
    if (!headers) return
    setResponseHeaders(headers)
}
