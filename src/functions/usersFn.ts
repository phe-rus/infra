import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { AdminMiddleware } from "@/middleware/admin-middleware"
import { OwnerMiddleware } from "@/middleware/owner-middleware"
import {
    banUserSchema,
    createUserSchema,
    revokeUserSessionSchema,
    setUserPasswordSchema,
    setUserRoleSchema,
    userIdSchema,
} from "@/schemas/users"

export const listUsersFn = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const headers = getRequestHeaders()
        const { users, total } = await auth.api.listUsers({
            headers,
            query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
        })
        return { users, total }
    })

export const createUserFn = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(createUserSchema)
    .handler(async ({ data, context: { sessions } }) => {
        // admins can only add plain users; only an owner can hand out admin/owner
        // or any custom (potentially elevated) role
        if (sessions.user.role !== "owner" && data.role !== "user") {
            throw new Error("Only an owner can create admin, owner, or custom-role accounts")
        }
        const headers = getRequestHeaders()
        const {
            response: { user },
            headers: responseHeaders,
        } = await auth.api.createUser({
            headers,
            returnHeaders: true,
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
        forwardAuthHeaders(responseHeaders)
        return user
    })

export const setUserRoleFn = createServerFn({ method: "POST" })
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
            body: { userId: data.userId, role: data.role as "owner" | "admin" | "user" },
        })
        forwardAuthHeaders(responseHeaders)
        return user
    })

export const removeUserFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't remove your own account")
        }
        const headers = getRequestHeaders()
        const { headers: responseHeaders, ...result } = await auth.api.removeUser({
            headers,
            returnHeaders: true,
            body: { userId: data.userId },
        })
        forwardAuthHeaders(responseHeaders)
        return result
    })

export const getUserDetailFn = createServerFn({ method: "GET" })
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

export const banUserFn = createServerFn({ method: "POST" })
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

export const unbanUserFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const {
            response: { user },
            headers: responseHeaders,
        } = await auth.api.unbanUser({
            headers,
            returnHeaders: true,
            body: { userId: data.userId },
        })
        forwardAuthHeaders(responseHeaders)
        return user
    })

export const revokeUserSessionFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(revokeUserSessionSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { headers: responseHeaders, ...result } = await auth.api.revokeUserSession({
            headers,
            returnHeaders: true,
            body: { sessionToken: data.sessionToken },
        })
        forwardAuthHeaders(responseHeaders)
        return result
    })

export const revokeUserSessionsFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { headers: responseHeaders, ...result } = await auth.api.revokeUserSessions({
            headers,
            returnHeaders: true,
            body: { userId: data.userId },
        })
        forwardAuthHeaders(responseHeaders)
        return result
    })

export const setUserPasswordFn = createServerFn({ method: "POST" })
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

export const impersonateUserFn = createServerFn({ method: "POST" })
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

// gated only by an active session, not owner/admin: while impersonating, the
// current session's role is the impersonated *target's* role, so an
// owner/admin check here would lock the admin out of their own escape hatch
export const stopImpersonatingFn = createServerFn({ method: "POST" })
    .handler(async () => {
        const headers = getRequestHeaders()
        const { headers: responseHeaders } = await auth.api.stopImpersonating({
            headers,
            returnHeaders: true,
        })
        forwardAuthHeaders(responseHeaders)
    })
