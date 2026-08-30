import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import type {
    SessionWithImpersonatedBy,
    UserWithRole,
} from "better-auth/plugins/admin"
import { env } from "cloudflare:workers"
import {
    MAX_FILE_BYTES,
    MAX_USER_QUOTA_BYTES,
    ALLOWED_TYPES,
    sniffExtension,
    isImageExtension,
    sanitizeSvg,
    avatarKey,
    avatarPrefix,
    getUserUsageBytes,
    listAllObjects,
    cdnPath,
} from "../../../shared/assets/src/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/lib/forward-headers"
import { AdminMiddleware, SessionMiddleware } from "@/middleware"
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

export const listUsers = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const headers = getRequestHeaders()
        const { users, total } = await auth.api.listUsers({
            headers,
            query: {
                limit: 100,
                sortBy: "createdAt",
                sortDirection: "desc",
            },
        })
        return { users, total }
    })

export type ListedUser = UserWithRole & {
    bio: string | null
    twoFactorEnabled?: boolean
}
export const getUserDetail = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const [user, { sessions }, { accounts }] = await Promise.all([
            auth.api.getUser({ headers, query: { id: data.userId } }),
            auth.api.listUserSessions({
                headers,
                body: { userId: data.userId },
            }),
            auth.api.adminListAccounts({
                headers,
                query: { userId: data.userId },
            }),
        ])
        return { user: user as ListedUser, sessions, accounts }
    })

export type UserDetail = Awaited<ReturnType<typeof getUserDetail>>
export type UsersListData = Awaited<ReturnType<typeof listUsers>>

export const createUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(createUserSchema)
    .handler(async ({ data }) => {
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
        if (!user.emailVerified) {
            await auth.api
                .sendVerificationEmail({
                    headers,
                    body: { email: data.email },
                })
                .catch(() => { })
        }

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
        const { headers: responseHeaders, ...result } =
            await auth.api.removeUser({
                headers,
                returnHeaders: true,
                body: { userId: data.userId },
            })
        forwardAuthHeaders(responseHeaders)
        return result
    })

export const updateUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(updateUserDetailsSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { response: user, headers: responseHeaders } =
            await auth.api.adminUpdateUser({
                headers: headers,
                returnHeaders: true,
                body: {
                    userId: data.userId,
                    data: {
                        ...(data.name !== undefined && {
                            name: data.name,
                        }),
                        ...(data.email !== undefined && {
                            email: data.email,
                        }),
                    },
                },
            })
        forwardAuthHeaders(responseHeaders)
        return user
    })

export const uploadUserImage = createServerFn({ method: "POST" })
    .validator((data: unknown) => data as FormData)
    .handler(async (): Promise<{ url: string }> => {
        throw new Error(
            "uploadUserImage is not supported: admins can't set another user's avatar (self-service only, via the avatar upload endpoint)"
        )
    })

export const setUserRole = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
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
            body: {
                userId: data.userId,
                role: data.role,
            },
        })
        forwardAuthHeaders(responseHeaders)
        return user
    })

export const setUserPassword = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(setUserPasswordSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { headers: responseHeaders, ...result } =
            await auth.api.setUserPassword({
                headers,
                returnHeaders: true,
                body: {
                    userId: data.userId,
                    newPassword: data.newPassword,
                },
            })
        forwardAuthHeaders(responseHeaders)
        return result
    })

export const disableUserTwoFactor = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
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
    .middleware([AdminMiddleware])
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
    .middleware([AdminMiddleware])
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
    .middleware([AdminMiddleware])
    .validator(revokeUserSessionSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { headers: responseHeaders, ...result } =
            await auth.api.revokeUserSession({
                headers,
                returnHeaders: true,
                body: {
                    sessionToken: data.sessionToken,
                },
            })
        forwardAuthHeaders(responseHeaders)
        return result
    })

export const revokeUserSessions = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { headers: responseHeaders, ...result } =
            await auth.api.revokeUserSessions({
                headers,
                returnHeaders: true,
                body: {
                    userId: data.userId,
                },
            })
        forwardAuthHeaders(responseHeaders)
        return result
    })

export const impersonateUser = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(userIdSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (data.userId === sessions.user.id) {
            throw new Error("You can't impersonate your own account")
        }
        const headers = getRequestHeaders()
        const { headers: responseHeaders } =
            await auth.api.impersonateUser({
                headers,
                body: { userId: data.userId },
                returnHeaders: true,
            })
        forwardAuthHeaders(responseHeaders)
    })

export const stopImpersonating = createServerFn({
    method: "POST",
}).handler(async () => {
    const headers = getRequestHeaders()
    const { headers: responseHeaders } =
        await auth.api.stopImpersonating({
            headers,
            returnHeaders: true,
        })
    forwardAuthHeaders(responseHeaders)
})

export const uploadOwnAvatar = createServerFn({ method: "POST" })
    .middleware([SessionMiddleware])
    .validator((data: unknown) => data as FormData)
    .handler(async ({ data, context: { sessions } }): Promise<{ url: string }> => {
        const file = data.get("file")
        if (!(file instanceof File)) {
            throw new Error("No file provided")
        }
        if (file.size > MAX_FILE_BYTES) {
            throw new Error(`File too large, max ${MAX_FILE_BYTES} bytes`)
        }

        const bytes = new Uint8Array(await file.arrayBuffer())
        const ext = sniffExtension(bytes)
        if (!ext) {
            throw new Error("Unrecognized or disallowed file type")
        }
        if (!isImageExtension(ext)) {
            throw new Error("Avatar must be an image")
        }
        const contentType = ALLOWED_TYPES[ext]
        const finalBytes =
            ext === "svg"
                ? new TextEncoder().encode(
                    await sanitizeSvg(new TextDecoder().decode(bytes))
                )
                : bytes

        if (!sessions) throw new Error("Not authenticated")
        const userId = sessions.user.id
        const [usage, existingAvatarObjects] = await Promise.all([
            getUserUsageBytes(env.R2, userId),
            listAllObjects(env.R2, avatarPrefix(userId)),
        ])
        const existingAvatarSize = existingAvatarObjects.reduce(
            (sum, obj) => sum + obj.size,
            0
        )
        const projectedUsage =
            usage - existingAvatarSize + finalBytes.byteLength
        if (projectedUsage > MAX_USER_QUOTA_BYTES) {
            throw new Error("Storage quota exceeded")
        }

        for (const obj of existingAvatarObjects) {
            await env.R2.delete(obj.key)
        }
        const key = avatarKey(userId, ext)
        await env.R2.put(key, finalBytes, { httpMetadata: { contentType } })

        const path = cdnPath(key, Date.now())
        const ctx = await auth.$context
        await ctx.adapter.update({
            model: "user",
            where: [{ field: "id", value: userId }],
            update: { image: path },
        })

        return { url: path }
    })
