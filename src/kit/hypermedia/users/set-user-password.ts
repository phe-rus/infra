import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { OwnerMiddleware } from "@/kit/middleware"
import { setUserPasswordSchema } from "@/kit/schemas"

export const setUserPassword = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(setUserPasswordSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { headers: responseHeaders, ...result } = await auth.api.setUserPassword({
            headers,
            returnHeaders: true,
            body: { userId: data.userId, newPassword: data.newPassword },
        })
        forwardAuthHeaders(responseHeaders)
        return result
    })
