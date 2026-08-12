import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { AdminMiddleware } from "@/kit/middleware"
import { assertCanAssignRole } from "@/kit/shared"
import { createUserSchema } from "@/kit/schemas"

export const createUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(createUserSchema)
    .handler(async ({ data, context: { sessions } }) => {
        assertCanAssignRole(sessions.user.role ?? "", data.role)
        const headers = getRequestHeaders()
        const {
            response: { user },
            headers: responseHeaders,
        } = await auth.api.createUser({
            headers: headers,
            returnHeaders: true,
            body: {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
            },
        })
        forwardAuthHeaders(responseHeaders)
        return user
    })
