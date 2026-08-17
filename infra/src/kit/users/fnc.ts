import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import type { SessionWithImpersonatedBy, UserWithRole } from "better-auth/plugins/admin"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/lib/forward-headers"
import { isOwner } from "@/auth/utils/permissions"
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
} from "./schema"

export type UserSession = SessionWithImpersonatedBy

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

// UserWithRole is better-auth's admin plugin's own declared return type for
// listUsers, hardcoded regardless of what other plugins are registered —
// deriving from Awaited<ReturnType<typeof listUsers>> doesn't help, it
// resolves back to this same declared type. twoFactorEnabled is real at
// runtime (the twoFactor plugin adds it to every user row, confirmed live)
// but missing from the static type, so it's added here by hand
export type ListedUser = UserWithRole & { twoFactorEnabled?: boolean }

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
        // same static-type gap as ListedUser above — auth.api.getUser's
        // declared return doesn't know about the twoFactor plugin either
        return { user: user as ListedUser, sessions, accounts }
    })

export type UserDetail = Awaited<ReturnType<typeof getUserDetail>>
export type UsersListData = Awaited<ReturnType<typeof listUsers>>

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
        const { response: user, headers: responseHeaders } = await auth.api.adminUpdateUser({
            headers: headers,
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

// better-auth's own disableTwoFactor endpoint is self-service only (it
// requires the CALLER's password to confirm), so an admin can't call it on
// someone else's behalf — this clears the flag and the stored secret/backup
// codes directly, for when a user has lost their authenticator and needs
// an owner to reset it for them
export const disableUserTwoFactor = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data }): Promise<{ success: true }> => {
        const ctx = await auth.$context
        await ctx.adapter.update({
            model: "user",
            where: [{ field: "id", value: data.userId }],
            update: { twoFactorEnabled: false },
        })
        await ctx.adapter.deleteMany({
            model: "twoFactor",
            where: [{ field: "userId", value: data.userId }],
        })
        return { success: true }
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
