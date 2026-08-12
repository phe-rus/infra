import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { OwnerMiddleware } from "@/kit/middleware"
import { banUserSchema } from "@/kit/schemas"

export const banUser = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(banUserSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't ban your own account")
        }
        const headers = getRequestHeaders()
        const {
            response: { user },
            headers: responseHeaders,
        } = await auth.api.banUser({
            headers,
            returnHeaders: true,
            body: {
                userId: data.userId,
                banReason: data.banReason,
                banExpiresIn: data.banExpiresIn,
            },
        })
        forwardAuthHeaders(responseHeaders)
        return user
    })
