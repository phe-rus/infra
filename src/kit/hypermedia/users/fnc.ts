import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { isOwner } from "@/auth/permissions"
import { AdminMiddleware, OwnerMiddleware } from "@/kit/middleware"
import { assertCanAssignRole } from "@/kit/shared"
import {
    banUserSchema,
    createUserSchema,
    revokeUserSessionSchema,
    setUserPasswordSchema,
    setUserRoleSchema,
    updateUserDetailsSchema,
    userIdSchema,
} from "@/kit/schemas"

function readImageUpload(data: unknown): { file: File; userId: string } {
    if (!(data instanceof FormData)) {
        throw new Error("Expected FormData")
    }
    const file = data.get("file")
    const userId = data.get("userId")
    if (!(file instanceof File) || typeof userId !== "string" || userId.length === 0) {
        throw new Error("Missing file or userId")
    }
    return { file, userId }
}

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
                data: {
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.email !== undefined && { email: data.email }),
                },
            },
        })
        forwardAuthHeaders(responseHeaders)
        return user
    })

export const uploadUserImage = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(readImageUpload)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { response, headers: responseHeaders } = await auth.api.uploadAvatar({
            headers,
            returnHeaders: true,
            body: { file: data.file, userId: data.userId },
        })
        forwardAuthHeaders(responseHeaders)
        return response
    })

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

export const unbanUser = createServerFn({ method: "POST" })
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

export const revokeUserSession = createServerFn({ method: "POST" })
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

export const revokeUserSessions = createServerFn({ method: "POST" })
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

export const impersonateUser = createServerFn({ method: "POST" })
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

// no middleware: while impersonating, the session's role is the target's
// role, so an owner/admin gate here would lock the admin out of this
export const stopImpersonating = createServerFn({ method: "POST" }).handler(async () => {
    const headers = getRequestHeaders()
    const { headers: responseHeaders } = await auth.api.stopImpersonating({
        headers,
        returnHeaders: true,
    })
    forwardAuthHeaders(responseHeaders)
})
