import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import type {
    SessionWithImpersonatedBy,
    UserWithRole,
} from "better-auth/plugins/admin"
import { authClient } from "@/lib/auth-client"
import { forwardAuthHeaders } from "@/lib/forward-headers"
import { AdminMiddleware } from "@/middleware"
import {
    banUserSchema,
    createUserSchema,
    revokeUserSessionSchema,
    setUserPasswordSchema,
    setUserRoleSchema,
    updateUserDetailsSchema,
    userIdSchema,
} from "./types"

export type UserSession = SessionWithImpersonatedBy

function headers() {
    return Object.fromEntries(Object.entries(getRequestHeaders()))
}

export const listUsers = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const { data } = await authClient.admin.listUsers({
            query: {
                limit: 100,
                sortBy: "createdAt",
                sortDirection: "desc",
            },
            fetchOptions: { headers: headers() },
        })
        return { users: data?.users ?? [], total: data?.total ?? 0 }
    })

export type ListedUser = UserWithRole & { twoFactorEnabled?: boolean }
export const getUserDetail = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data }) => {
        const h = headers()
        const [{ data: user }, { data: sessionData }, { data: accountData }] =
            await Promise.all([
                authClient.admin.getUser({
                    query: { id: data.userId },
                    fetchOptions: { headers: h },
                }),
                authClient.admin.listUserSessions({
                    userId: data.userId,
                    fetchOptions: { headers: h },
                }),
                authClient.admin.listAccounts({
                    query: { userId: data.userId },
                    fetchOptions: { headers: h },
                }),
            ])
        return {
            user: user as ListedUser,
            sessions: sessionData?.sessions ?? [],
            accounts: accountData?.accounts ?? [],
        }
    })

export type UserDetail = Awaited<ReturnType<typeof getUserDetail>>
export type UsersListData = Awaited<ReturnType<typeof listUsers>>

export const createUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(createUserSchema)
    .handler(async ({ data }) => {
        const h = headers()
        const { data: created } = await authClient.admin.createUser({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            fetchOptions: { headers: h },
        })
        if (created && !created.user.emailVerified) {
            await authClient
                .sendVerificationEmail({
                    email: data.email,
                    fetchOptions: { headers: h },
                })
                .catch(() => {})
        }
        return created?.user
    })

export const removeUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't remove your own account")
        }
        const { data: result } = await authClient.admin.removeUser({
            userId: data.userId,
            fetchOptions: { headers: headers() },
        })
        return result
    })

export const updateUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(updateUserDetailsSchema)
    .handler(async ({ data }) => {
        const { data: user } = await authClient.admin.updateUser({
            userId: data.userId,
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.email !== undefined && { email: data.email }),
            },
            fetchOptions: { headers: headers() },
        })
        return user
    })

export const setUserRole = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(setUserRoleSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't change your own role here")
        }
        const { data: result } = await authClient.admin.setRole({
            userId: data.userId,
            role: data.role,
            fetchOptions: { headers: headers() },
        })
        return result?.user
    })

export const setUserPassword = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(setUserPasswordSchema)
    .handler(async ({ data }) => {
        const { data: result } = await authClient.admin.setUserPassword({
            userId: data.userId,
            newPassword: data.newPassword,
            fetchOptions: { headers: headers() },
        })
        return result
    })

export const banUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(banUserSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't ban your own account")
        }
        const { data: result } = await authClient.admin.banUser({
            userId: data.userId,
            banReason: data.banReason,
            banExpiresIn: data.banExpiresIn,
            fetchOptions: { headers: headers() },
        })
        return result?.user
    })

export const unbanUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data }) => {
        const { data: result } = await authClient.admin.unbanUser({
            userId: data.userId,
            fetchOptions: { headers: headers() },
        })
        return result?.user
    })

export const revokeUserSession = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(revokeUserSessionSchema)
    .handler(async ({ data }) => {
        const { data: result } = await authClient.admin.revokeUserSession({
            sessionToken: data.sessionToken,
            fetchOptions: { headers: headers() },
        })
        return result
    })

export const revokeUserSessions = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data }) => {
        const { data: result } = await authClient.admin.revokeUserSessions({
            userId: data.userId,
            fetchOptions: { headers: headers() },
        })
        return result
    })

export const impersonateUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't impersonate your own account")
        }
        await authClient.admin.impersonateUser({
            userId: data.userId,
            fetchOptions: {
                headers: headers(),
                onResponse: (ctx) => forwardAuthHeaders(ctx.response.headers),
            },
        })
    })

export const stopImpersonating = createServerFn({
    method: "POST",
}).handler(async () => {
    await authClient.admin.stopImpersonating({
        fetchOptions: {
            headers: headers(),
            onResponse: (ctx) => forwardAuthHeaders(ctx.response.headers),
        },
    })
})
