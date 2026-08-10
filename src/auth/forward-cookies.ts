import { parseSetCookieHeader, toCookieOptions } from "better-auth/cookies"
import { setCookie } from "@tanstack/react-start/server"

// auth.api.X() calls made from within a TanStack Start server function don't
// go through an HTTP round trip, so better-auth has nothing to attach
// Set-Cookie to on its own — the tanstackStartCookies plugin tries to bridge
// this via a hook, but that relies on TanStack's request-scoped
// AsyncLocalStorage still being current by the time the hook runs, which
// this app's own execCtxStorage wrapping around the Workers fetch handler
// doesn't reliably preserve. Pass `returnHeaders: true` to the auth.api.X()
// call and forward the result here, synchronously in the same handler, so
// TanStack's setCookie() runs in a context we know is still valid.
export function forwardAuthCookies(headers: Headers | undefined) {
    const setCookies = headers?.get("set-cookie")
    if (!setCookies) return
    const parsed = parseSetCookieHeader(setCookies)
    parsed.forEach((value, key) => {
        if (!key) return
        setCookie(key, value.value, toCookieOptions(value))
    })
}
