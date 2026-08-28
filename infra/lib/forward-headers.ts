import { setResponseHeader } from "@tanstack/react-start/server"

export function forwardAuthHeaders(headers: Headers | undefined) {
    if (!headers) return
    for (const [name, value] of headers.entries()) {
        if (name.toLowerCase() === "set-cookie") continue
        setResponseHeader(name, value)
    }
    const setCookies =
        typeof headers.getSetCookie === "function"
            ? headers.getSetCookie()
            : (() => {
                  const raw = headers.get("set-cookie")
                  return raw ? [raw] : []
              })()
    if (setCookies.length > 0) {
        setResponseHeader("set-cookie", setCookies)
    }
}
