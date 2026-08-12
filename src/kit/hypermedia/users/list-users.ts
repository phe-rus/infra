import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { AdminMiddleware } from "@/kit/middleware"

export const listUsers = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const headers = getRequestHeaders()
        const { users, total } = await auth.api.listUsers({
            headers,
            query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
        })
        return { users, total }
    })
