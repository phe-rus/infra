import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { OwnerMiddleware } from "@/kit/middleware"
import { userIdSchema } from "@/kit/schemas"

export const unbanUser = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const {
            response: { user },
            headers: responseHeaders,
        } = await auth.api.unbanUser({
            headers,
            returnHeaders: true,
            body: { userId: data.userId },
        })
        forwardAuthHeaders(responseHeaders)
        return user
    })
