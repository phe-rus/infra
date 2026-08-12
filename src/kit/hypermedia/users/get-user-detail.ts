import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { AdminMiddleware } from "@/kit/middleware"
import { userIdSchema } from "@/kit/schemas"

export const getUserDetail = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const [user, { sessions }, ctx] = await Promise.all([
            auth.api.getUser({ headers, query: { id: data.userId } }),
            auth.api.listUserSessions({ headers, body: { userId: data.userId } }),
            auth.$context,
        ])
        // only the identifying fields, never tokens or password hashes
        const accounts = await ctx.adapter.findMany<{
            id: string
            providerId: string
            accountId: string
            createdAt: Date
            updatedAt: Date
        }>({
            model: "account",
            where: [{ field: "userId", value: data.userId }],
            limit: 50,
            select: ["id", "providerId", "accountId", "createdAt", "updatedAt"],
        })
        return { user, sessions, accounts }
    })
