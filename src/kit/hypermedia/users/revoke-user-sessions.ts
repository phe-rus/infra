import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { OwnerMiddleware } from "@/kit/middleware"
import { userIdSchema } from "@/kit/schemas"

export const revokeUserSessions = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { headers: responseHeaders, ...result } = await auth.api.revokeUserSessions({
            headers,
            returnHeaders: true,
            body: { userId: data.userId },
        })
        forwardAuthHeaders(responseHeaders)
        return result
    })
