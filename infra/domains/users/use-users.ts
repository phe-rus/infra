import { useMutation } from "@tanstack/react-query"
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
} from "./fnc"
import { patchUserInCache, useAppMutation } from "@/kit/shared"
import type { UsersListData } from "./fnc"
import { getContext } from "@/lib/queryClient"
import { t } from "@infra/ui/components/sonner"
import { meQueryOptions } from "@/kit/auth"
import { usersQueryOptions } from "./get-user"

export const useCreateUser = () =>
    useAppMutation({
        mutationFn: createUser,
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "User added",
        errorMessage: "Could not add user",
    })

export const useRemoveUser = () =>
    useAppMutation({
        mutationFn: removeUser,
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                old
                    ? {
                          ...old,
                          users: old.users.filter((u) => u.id !== variables.data.userId),
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
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, {
                    ...(variables.data.name !== undefined && { name: variables.data.name }),
                    ...(variables.data.email !== undefined && { email: variables.data.email }),
                }),
        },
        successMessage: "Details updated",
        errorMessage: "Could not update details",
    })

// invalidating ["users"] cascades to the open detail drawer's ["users", userId]
// query too (React Query's default prefix match), so no manual cache patch
// is needed here despite not knowing the versioned image URL until it lands
export const useUploadUserImage = () =>
    useAppMutation({
        mutationFn: uploadUserImage,
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "Image updated",
        errorMessage: "Could not update image",
    })

export const useSetUserRole = () =>
    useAppMutation({
        mutationFn: setUserRole,
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, { role: variables.data.role }),
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
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, { twoFactorEnabled: false }),
        },
        successMessage: "Two-factor disabled",
        errorMessage: "Could not disable two-factor",
    })

export const useBanUser = () =>
    useAppMutation({
        mutationFn: banUser,
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, { banned: true }),
        },
        successMessage: "User banned",
        errorMessage: "Could not ban user",
    })

export const useUnbanUser = () =>
    useAppMutation({
        mutationFn: unbanUser,
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, { banned: false }),
        },
        successMessage: "User unbanned",
        errorMessage: "Could not unban user",
    })

export const useRevokeUserSession = () =>
    useAppMutation({
        mutationFn: revokeUserSession,
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "Session revoked",
        errorMessage: "Could not revoke session",
    })

export const useRevokeUserSessions = () =>
    useAppMutation({
        mutationFn: revokeUserSessions,
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "All sessions revoked",
        errorMessage: "Could not revoke sessions",
    })

export const useImpersonateUser = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: impersonateUser,
        onSuccess: () => {
            t.success("Impersonating user")
            q.clear()
            setTimeout(() => {
                router.navigate({ to: "/", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Could not impersonate user", { description: error.message })
        },
    })
}

export const useStopImpersonating = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: stopImpersonating,
        onSuccess: () => {
            t.success("Back to your account")
            q.clear()
            q.prefetchQuery(meQueryOptions())
            setTimeout(() => {
                router.navigate({ to: "/", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Could not stop impersonating", { description: error.message })
        },
    })
}
