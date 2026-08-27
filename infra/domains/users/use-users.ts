import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import {
    banUser,
    createUser,
    disableUserTwoFactor,
    impersonateUser,
    removeUser,
    revokeUserSession,
    revokeUserSessions,
    setUserPassword,
    setUserRole,
    stopImpersonating,
    unbanUser,
    updateUser,
    uploadOwnAvatar,
    uploadUserImage,
} from "./func"
import { useAppMutation } from "@infra/ui/hooks"
import type { ListedUser, UsersListData } from "./func"
import { getContext } from "@/lib/queryClient"
import { meOptions } from "@/domains/auth"
import { userDetailOptions, usersOptions } from "./get-users"

function patchUserInCache(
    old: UsersListData | undefined,
    userId: string,
    patch: Partial<ListedUser>
): UsersListData {
    if (!old) return { users: [], total: 0 }
    return {
        ...old,
        users: old.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
    }
}

export const useUsers = () => useSuspenseQuery(usersOptions())

export const useUserDetail = (userId: string | null) =>
    useQuery(
        queryOptions({
            ...userDetailOptions(userId ?? ""),
            enabled: Boolean(userId),
        })
    )

export const useCreateUser = () =>
    useAppMutation({
        mutationFn: createUser,
        invalidates: [usersOptions().queryKey],
        successMessage: "User added",
        successDescription: (user) =>
            user.emailVerified
                ? undefined
                : `Verification email sent to ${user.email}`,
        errorMessage: "Could not add user",
    })

export const useRemoveUser = (currentUserId: string) =>
    useAppMutation({
        mutationFn: (userId: string) => {
            if (userId === currentUserId) {
                throw new Error("You can't remove your own account")
            }
            return removeUser(userId)
        },
        invalidates: [usersOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersOptions().queryKey,
            updater: (old: UsersListData | undefined, userId: string) =>
                old
                    ? {
                          ...old,
                          users: old.users.filter((u) => u.id !== userId),
                          total: Math.max(0, old.total - 1),
                      }
                    : { users: [], total: 0 },
        },
        successMessage: "User removed",
        errorMessage: "Could not remove user",
    })

export const useUpdateUserDetails = () =>
    useAppMutation({
        mutationFn: updateUser,
        invalidates: [usersOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.userId, {
                    ...(variables.name !== undefined && {
                        name: variables.name,
                    }),
                    ...(variables.email !== undefined && {
                        email: variables.email,
                    }),
                }),
        },
        successMessage: "Details updated",
        errorMessage: "Could not update details",
    })

export const useUploadUserImage = () =>
    useAppMutation({
        mutationFn: uploadUserImage,
        invalidates: [usersOptions().queryKey],
        successMessage: "Image updated",
        errorMessage: "Could not update image",
    })

export const useUploadOwnAvatar = () =>
    useAppMutation({
        mutationFn: uploadOwnAvatar,
        invalidates: [usersOptions().queryKey, ["me"]],
        successMessage: "Image updated",
        errorMessage: "Could not update image",
    })

export const useSetUserRole = (currentUserId: string) =>
    useAppMutation({
        mutationFn: (input: { userId: string; role: "admin" | "user" }) => {
            if (input.userId === currentUserId) {
                throw new Error("You can't change your own role here")
            }
            return setUserRole(input)
        },
        invalidates: [usersOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.userId, {
                    role: variables.role,
                }),
        },
        successMessage: "Role updated",
        errorMessage: "Could not update role",
    })

export const useSetUserPassword = () =>
    useAppMutation({
        mutationFn: setUserPassword,
        successMessage: "Password updated",
        errorMessage: "Could not set password",
    })

export const useDisableUserTwoFactor = () =>
    useAppMutation({
        mutationFn: disableUserTwoFactor,
        invalidates: [usersOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersOptions().queryKey,
            updater: (old: UsersListData | undefined, userId: string) =>
                patchUserInCache(old, userId, {
                    twoFactorEnabled: false,
                }),
        },
        successMessage: "Two-factor disabled",
        errorMessage: "Could not disable two-factor",
    })

export const useBanUser = (currentUserId: string) =>
    useAppMutation({
        mutationFn: (input: {
            userId: string
            banReason?: string
            banExpiresIn?: number
        }) => {
            if (input.userId === currentUserId) {
                throw new Error("You can't ban your own account")
            }
            return banUser(input)
        },
        invalidates: [usersOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.userId, { banned: true }),
        },
        successMessage: "User banned",
        errorMessage: "Could not ban user",
    })

export const useUnbanUser = () =>
    useAppMutation({
        mutationFn: unbanUser,
        invalidates: [usersOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersOptions().queryKey,
            updater: (old: UsersListData | undefined, userId: string) =>
                patchUserInCache(old, userId, { banned: false }),
        },
        successMessage: "User unbanned",
        errorMessage: "Could not unban user",
    })

export const useRevokeUserSession = () =>
    useAppMutation({
        mutationFn: revokeUserSession,
        invalidates: [usersOptions().queryKey],
        successMessage: "Session revoked",
        errorMessage: "Could not revoke session",
    })

export const useRevokeUserSessions = () =>
    useAppMutation({
        mutationFn: revokeUserSessions,
        invalidates: [usersOptions().queryKey],
        successMessage: "All sessions revoked",
        errorMessage: "Could not revoke sessions",
    })

export const useImpersonateUser = (currentUserId: string) => {
    const router = useRouter()
    const q = getContext()
    return useAppMutation({
        mutationFn: (userId: string) => {
            if (userId === currentUserId) {
                throw new Error("You can't impersonate your own account")
            }
            return impersonateUser(userId)
        },
        successMessage: "Impersonating user",
        onSuccess: () => {
            q.clear()
            setTimeout(() => {
                router.navigate({ to: "/", replace: true })
            }, 50)
        },
        errorMessage: "Could not impersonate user",
    })
}

export const useStopImpersonating = () => {
    const router = useRouter()
    const q = getContext()
    return useAppMutation({
        mutationFn: stopImpersonating,
        successMessage: "Back to your account",
        onSuccess: () => {
            q.clear()
            q.prefetchQuery(meOptions())
            setTimeout(() => {
                router.navigate({ to: "/", replace: true })
            }, 50)
        },
        errorMessage: "Could not stop impersonating",
    })
}
