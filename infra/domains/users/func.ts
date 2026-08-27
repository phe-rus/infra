import type {
    SessionWithImpersonatedBy,
    UserWithRole
} from "better-auth/plugins/admin"
import { authClient, apiUrl } from "@/lib/auth-client"
import type {
    banUserSchema,
    createUserSchema,
    setUserPasswordSchema,
    setUserRoleSchema,
    updateUserDetailsSchema,
} from "./types"
import type { z } from "zod"

export type UserSession = SessionWithImpersonatedBy
export type ListedUser = UserWithRole & { twoFactorEnabled?: boolean }

export async function listUsers() {
    const { data, error } = await authClient.admin.listUsers({
        query: {
            limit: 100,
            sortBy: "createdAt",
            sortDirection: "desc",
        },
    })
    if (error) throw new Error(error.message ?? "Could not list users")
    return {
        users: data?.users ?? [],
        total: data?.total ?? 0,
    }
}

export type UsersListData = Awaited<ReturnType<typeof listUsers>>

export async function getUserDetail(userId: string) {
    const [
        { data: user, error: userError },
        { data: sessionData, error: sessionError },
        { data: accountData, error: accountError },
    ] = await Promise.all([
        authClient.admin.getUser({ query: { id: userId } }),
        authClient.admin.listUserSessions({ userId }),
        authClient.admin.listAccounts({ query: { userId } }),
    ])
    const error = userError ?? sessionError ?? accountError
    if (error) throw new Error(error.message ?? "Could not load user")
    return {
        user: user as ListedUser,
        sessions: sessionData?.sessions ?? [],
        accounts: accountData?.accounts ?? [],
    }
}

export type UserDetail = Awaited<ReturnType<typeof getUserDetail>>

export async function createUser(input: z.infer<typeof createUserSchema>) {
    const { data: created, error } = await authClient.admin.createUser({
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
    })
    if (error || !created) {
        throw new Error(error?.message ?? "Could not create user")
    }
    if (!created.user.emailVerified) {
        await authClient
            .sendVerificationEmail({
                email: input.email,
                callbackURL: window.location.origin,
            })
            .catch(() => { })
    }
    return created.user
}

export async function removeUser(userId: string) {
    const { data } = await authClient.admin.removeUser({ userId })
    return data
}

export async function updateUser(
    input: z.infer<typeof updateUserDetailsSchema>
) {
    const { data } = await authClient.admin.updateUser({
        userId: input.userId,
        data: {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.email !== undefined && { email: input.email }),
        },
    })
    return data
}

export async function setUserRole(input: z.infer<typeof setUserRoleSchema>) {
    const { data } = await authClient.admin.setRole({
        userId: input.userId,
        role: input.role,
    })
    return data?.user
}

export async function setUserPassword(
    input: z.infer<typeof setUserPasswordSchema>
) {
    const { data } = await authClient.admin.setUserPassword({
        userId: input.userId,
        newPassword: input.newPassword,
    })
    return data
}

export async function banUser(input: z.infer<typeof banUserSchema>) {
    const { data } = await authClient.admin.banUser({
        userId: input.userId,
        banReason: input.banReason,
        banExpiresIn: input.banExpiresIn,
    })
    return data?.user
}

export async function unbanUser(userId: string) {
    const { data } = await authClient.admin.unbanUser({ userId })
    return data?.user
}

export async function revokeUserSession(sessionToken: string) {
    const { data } = await authClient.admin.revokeUserSession({
        sessionToken,
    })
    return data
}

export async function revokeUserSessions(userId: string) {
    const { data } = await authClient.admin.revokeUserSessions({ userId })
    return data
}

export async function impersonateUser(userId: string) {
    await authClient.admin.impersonateUser({ userId })
}

export async function stopImpersonating() {
    await authClient.admin.stopImpersonating()
}

export async function uploadUserImage(
    _formData: FormData
): Promise<{ url: string }> {
    throw new Error(
        "uploadUserImage is no longer supported: admins can't set another user's avatar (self-service only, via api/'s /assets/avatar route)"
    )
}

export async function uploadOwnAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.set("file", file)
    const res = await fetch(`${apiUrl()}/api/assets/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
    })
    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`Could not upload avatar (${res.status}): ${body}`)
    }
    return await res.json()
}

export async function disableUserTwoFactor(
    _userId: string
): Promise<{ success: true }> {
    throw new Error(
        "disableUserTwoFactor is not yet available: it needs a dedicated api/ endpoint (was raw internalAdapter access, no client equivalent)"
    )
}
