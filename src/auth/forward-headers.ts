import { setResponseHeaders } from "@tanstack/react-start/server"

export function forwardAuthHeaders(headers: Headers | undefined) {
    if (!headers) return
    setResponseHeaders(headers)
}
