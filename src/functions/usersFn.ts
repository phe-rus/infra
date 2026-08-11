import { createServerFn } from "@tanstack/react-start"
import { queryOptions } from "@tanstack/react-query"
import { auth } from "@/auth"
import { forwardAuthCookies } from "@/auth/forward-cookies"
import { AdminMiddleware, OwnerMiddleware, RequestMiddleware } from "./protectionFn"
import { z } from "zod"

export const listUsersFn = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async ({ context: { headers } }) => {
        const { users, total } = await auth.api.listUsers({
            headers,
            query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
        })
        return { users, total }
    })

export type ListedUser = Awaited<ReturnType<typeof listUsersFn>>["users"][number]

export const usersQueryOptions = () =>
    queryOptions({
        queryKey: ["users"],
        queryFn: () => listUsersFn(),
    })

const createUserSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8).max(48),
    role: z.string().min(1),
})

export const createUserFn = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(createUserSchema)
    .handler(async ({ data, context: { sessions, headers } }) => {
        // admins can only add plain users; only an owner can hand out admin/owner
        // or any custom (potentially elevated) role
        if (sessions.user.role !== "owner" && data.role !== "user") {
            throw new Error("Only an owner can create admin, owner, or custom-role accounts")
        }
        const { user } = await auth.api.createUser({
            headers,
            body: {
                name: data.name,
                email: data.email,
                password: data.password,
                // custom role names are loaded at runtime, so better-auth's
                // inferred role union (derived from defaultRole/adminRoles)
                // can't statically include them
                role: data.role as "owner" | "admin" | "user",
            },
        })
        return user
    })

const setUserRoleSchema = z.object({
    userId: z.string().min(1),
    role: z.string().min(1),
})

export const setUserRoleFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(setUserRoleSchema)
    .handler(async ({ data, context: { sessions, headers } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't change your own role here")
        }
        const { user } = await auth.api.setRole({
            headers,
            body: { userId: data.userId, role: data.role as "owner" | "admin" | "user" },
        })
        return user
    })

const removeUserSchema = z.object({
    userId: z.string().min(1),
})

export const removeUserFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(removeUserSchema)
    .handler(async ({ data, context: { sessions, headers } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't remove your own account")
        }
        return await auth.api.removeUser({
            headers,
            body: { userId: data.userId },
        })
    })

const userIdSchema = z.object({ userId: z.string().min(1) })

export const getUserDetailFn = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data, context: { headers } }) => {
        const [user, { sessions }, ctx] = await Promise.all([
            auth.api.getUser({ headers, query: { id: data.userId } }),
            auth.api.listUserSessions({ headers, body: { userId: data.userId } }),
            auth.$context,
        ])
        // only the identifying fields — never tokens or password hashes
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

export type UserDetail = Awaited<ReturnType<typeof getUserDetailFn>>

export const userDetailQueryOptions = (userId: string) =>
    queryOptions({
        queryKey: ["users", userId],
        queryFn: () => getUserDetailFn({ data: { userId } }),
        enabled: Boolean(userId),
    })

const banUserSchema = z.object({
    userId: z.string().min(1),
    banReason: z.string().optional(),
    banExpiresIn: z.number().positive().optional(),
})

export const banUserFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(banUserSchema)
    .handler(async ({ data, context: { sessions, headers } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't ban your own account")
        }
        const { user } = await auth.api.banUser({
            headers,
            body: {
                userId: data.userId,
                banReason: data.banReason,
                banExpiresIn: data.banExpiresIn,
            },
        })
        return user
    })

export const unbanUserFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data, context: { headers } }) => {
        const { user } = await auth.api.unbanUser({ headers, body: { userId: data.userId } })
        return user
    })

const revokeUserSessionSchema = z.object({ sessionToken: z.string().min(1) })

export const revokeUserSessionFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(revokeUserSessionSchema)
    .handler(async ({ data, context: { headers } }) => {
        return await auth.api.revokeUserSession({
            headers,
            body: { sessionToken: data.sessionToken },
        })
    })

export const revokeUserSessionsFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data, context: { headers } }) => {
        return await auth.api.revokeUserSessions({ headers, body: { userId: data.userId } })
    })

const setUserPasswordSchema = z.object({
    userId: z.string().min(1),
    newPassword: z.string().min(8).max(48),
})

export const setUserPasswordFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(setUserPasswordSchema)
    .handler(async ({ data, context: { headers } }) => {
        return await auth.api.setUserPassword({
            headers,
            body: { userId: data.userId, newPassword: data.newPassword },
        })
    })

export const impersonateUserFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data, context: { sessions, headers } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't impersonate your own account")
        }
        const { headers: responseHeaders } = await auth.api.impersonateUser({
            headers,
            body: { userId: data.userId },
            returnHeaders: true,
        })
        forwardAuthCookies(responseHeaders)
    })

// gated only by an active session, not owner/admin — while impersonating, the
// current session's role is the impersonated *target's* role, so an
// owner/admin check here would lock the admin out of their own escape hatch
export const stopImpersonatingFn = createServerFn({ method: "POST" })
    .middleware([RequestMiddleware])
    .handler(async ({ context: { request } }) => {
        const { headers: responseHeaders } = await auth.api.stopImpersonating({
            headers: request.headers,
            returnHeaders: true,
        })
        forwardAuthCookies(responseHeaders)
    })
