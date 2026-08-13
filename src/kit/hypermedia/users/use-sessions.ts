import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import {
    banUser,
    impersonateUser,
    revokeUserSession,
    revokeUserSessions,
    setUserPassword,
    setUserRole,
    stopImpersonating,
    unbanUser,
} from "./fnc"
import { patchUserInCache, useAppMutation } from "@/kit/shared"
import type { UsersListData } from "@/kit/types"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"
import { meQueryOptions } from "@/kit/auth"
import { usersQueryOptions } from "./get-users"

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
