import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { OwnerMiddleware } from "@/kit/middleware"
import { setUserRoleSchema } from "@/kit/schemas"

export const setUserRole = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(setUserRoleSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't change your own role here")
        }
        const headers = getRequestHeaders()
        const {
            response: { user },
            headers: responseHeaders,
        } = await auth.api.setRole({
            headers,
            returnHeaders: true,
            body: { userId: data.userId, role: data.role },
        })
        forwardAuthHeaders(responseHeaders)
        return user
    })
