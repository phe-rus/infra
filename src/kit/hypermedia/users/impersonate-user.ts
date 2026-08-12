import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { OwnerMiddleware } from "@/kit/middleware"
import { userIdSchema } from "@/kit/schemas"

export const impersonateUser = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't impersonate your own account")
        }
        const headers = getRequestHeaders()
        const { headers: responseHeaders } = await auth.api.impersonateUser({
            headers,
            body: { userId: data.userId },
            returnHeaders: true,
        })
        forwardAuthHeaders(responseHeaders)
    })
