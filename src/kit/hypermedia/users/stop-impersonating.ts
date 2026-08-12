import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"

// no middleware: while impersonating, the session's role is the target's
// role, so an owner/admin gate here would lock the admin out of this
export const stopImpersonating = createServerFn({ method: "POST" }).handler(async () => {
    const headers = getRequestHeaders()
    const { headers: responseHeaders } = await auth.api.stopImpersonating({
        headers,
        returnHeaders: true,
    })
    forwardAuthHeaders(responseHeaders)
})
