import {
    banUserFn,
    createUserFn,
    getUserDetailFn,
    impersonateUserFn,
    listUsersFn,
    removeUserFn,
    revokeUserSessionFn,
    revokeUserSessionsFn,
    setUserPasswordFn,
    setUserRoleFn,
    stopImpersonatingFn,
    unbanUserFn,
} from "@/functions/usersFn"
import { useMeOptions } from "@/hooks/authHooks"
import { useAppMutation } from "@/hooks/useAppMutation"
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { getContext } from "@/lib/queryClient"
import { withTimeout } from "@/lib/with-timeout"
import { t } from "@/components/ui/sonner"
import type { ListedUser } from "@/types"

type UsersListData = Awaited<ReturnType<typeof listUsersFn>>

function updateUser(old: UsersListData | undefined, userId: string, patch: Partial<ListedUser>): UsersListData {
    if (!old) return { users: [], total: 0 }
    return { ...old, users: old.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)) }
}

export const usersQueryOptions = () =>
    queryOptions({
        queryKey: ["users"],
        queryFn: () => withTimeout(listUsersFn)(),
    })

export const userDetailQueryOptions = (userId: string) =>
    queryOptions({
        queryKey: ["users", userId],
        queryFn: () => withTimeout(getUserDetailFn)({ data: { userId } }),
        enabled: Boolean(userId),
    })

export const useCreateUser = () =>
    useAppMutation({
        mutationFn: withTimeout(createUserFn),
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "User added",
        errorMessage: "Could not add user",
    })

export const useSetUserRole = () =>
    useAppMutation({
        mutationFn: withTimeout(setUserRoleFn),
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                updateUser(old, variables.data.userId, { role: variables.data.role }),
        },
        successMessage: "Role updated",
        errorMessage: "Could not update role",
    })

export const useRemoveUser = () =>
    useAppMutation({
        mutationFn: withTimeout(removeUserFn),
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

export const useUserDetail = (userId: string | null) => {
    return useQuery(
        queryOptions({
            ...userDetailQueryOptions(userId ?? ""),
            enabled: Boolean(userId),
        })
    )
}

export const useBanUser = () =>
    useAppMutation({
        mutationFn: withTimeout(banUserFn),
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                updateUser(old, variables.data.userId, { banned: true }),
        },
        successMessage: "User banned",
        errorMessage: "Could not ban user",
    })

export const useUnbanUser = () =>
    useAppMutation({
        mutationFn: withTimeout(unbanUserFn),
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                updateUser(old, variables.data.userId, { banned: false }),
        },
        successMessage: "User unbanned",
        errorMessage: "Could not unban user",
    })

export const useRevokeUserSession = () =>
    useAppMutation({
        mutationFn: withTimeout(revokeUserSessionFn),
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "Session revoked",
        errorMessage: "Could not revoke session",
    })

export const useRevokeUserSessions = () =>
    useAppMutation({
        mutationFn: withTimeout(revokeUserSessionsFn),
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "All sessions revoked",
        errorMessage: "Could not revoke sessions",
    })

export const useSetUserPassword = () =>
    useAppMutation({
        mutationFn: withTimeout(setUserPasswordFn),
        successMessage: "Password updated",
        errorMessage: "Could not set password",
    })

// impersonation swaps out the entire session identity, so it needs a full
// cache wipe and a navigation, not the generic invalidate-and-toast pattern
export const useImpersonateUser = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: withTimeout(impersonateUserFn),
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
        mutationFn: withTimeout(stopImpersonatingFn),
        onSuccess: () => {
            t.success("Back to your account")
            q.clear()
            q.prefetchQuery(useMeOptions())
            setTimeout(() => {
                router.navigate({ to: "/", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Could not stop impersonating", { description: error.message })
        },
    })
}
