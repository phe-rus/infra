import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { isOwner } from "@/auth/permissions"
import { AdminMiddleware } from "@/kit/middleware"
import { userIdSchema } from "@/kit/schemas"

export const removeUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't remove your own account")
        }
        const headers = getRequestHeaders()
        // admins can remove anyone except an owner; only an owner can remove an owner
        if (!isOwner(sessions.user.role ?? "")) {
            const target = await auth.api.getUser({ headers, query: { id: data.userId } })
            if (isOwner(target?.role ?? "")) {
                throw new Error("Only an owner can remove an owner account")
            }
        }
        const { headers: responseHeaders, ...result } = await auth.api.removeUser({
            headers,
            returnHeaders: true,
            body: { userId: data.userId },
        })
        forwardAuthHeaders(responseHeaders)
        return result
    })
