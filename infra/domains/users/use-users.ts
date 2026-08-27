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

export const useRemoveUser = () =>
    useAppMutation({
        mutationFn: removeUser,
        invalidates: [usersOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                old
                    ? {
                          ...old,
                          users: old.users.filter(
                              (u) => u.id !== variables.data.userId
                          ),
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
                patchUserInCache(old, variables.data.userId, {
                    ...(variables.data.name !== undefined && {
                        name: variables.data.name,
                    }),
                    ...(variables.data.email !== undefined && {
                        email: variables.data.email,
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

export const useSetUserRole = () =>
    useAppMutation({
        mutationFn: setUserRole,
        invalidates: [usersOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, {
                    role: variables.data.role,
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
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, {
                    twoFactorEnabled: false,
                }),
        },
        successMessage: "Two-factor disabled",
        errorMessage: "Could not disable two-factor",
    })

export const useBanUser = () =>
    useAppMutation({
        mutationFn: banUser,
        invalidates: [usersOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, { banned: true }),
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
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, { banned: false }),
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

export const useImpersonateUser = () => {
    const router = useRouter()
    const q = getContext()
    return useAppMutation({
        mutationFn: impersonateUser,
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
