import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { AdminMiddleware } from "@/kit/middleware"
import { updateUserDetailsSchema } from "@/kit/schemas"

// admin, no owner-target restriction: both roles carry identical adminAc
// statements (permissions.ts), so auth.api.adminUpdateUser's own
// field-level permission check never blocks either one here
export const updateUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(updateUserDetailsSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        // adminUpdateUser returns the user directly, not wrapped in { user }
        // like its sibling admin.* endpoints
        const {
            response: user,
            headers: responseHeaders,
        } = await auth.api.adminUpdateUser({
            headers,
            returnHeaders: true,
            body: {
                userId: data.userId,
                data: { name: data.name, email: data.email },
            },
        })
        forwardAuthHeaders(responseHeaders)
        return user
    })
