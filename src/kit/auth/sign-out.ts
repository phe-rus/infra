import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
    const headers = getRequestHeaders()
    const { headers: responseHeaders } = await auth.api.signOut({
        headers,
        returnHeaders: true,
    })
    forwardAuthHeaders(responseHeaders)
})
