import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { OwnerMiddleware } from "@/kit/middleware"
import { revokeUserSessionSchema } from "@/kit/schemas"

export const revokeUserSession = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(revokeUserSessionSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { headers: responseHeaders, ...result } = await auth.api.revokeUserSession({
            headers,
            returnHeaders: true,
            body: { sessionToken: data.sessionToken },
        })
        forwardAuthHeaders(responseHeaders)
        return result
    })
