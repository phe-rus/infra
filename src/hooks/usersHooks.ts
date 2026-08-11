import {
    banUserFn,
    createUserFn,
    impersonateUserFn,
    removeUserFn,
    revokeUserSessionFn,
    revokeUserSessionsFn,
    setUserPasswordFn,
    setUserRoleFn,
    stopImpersonatingFn,
    unbanUserFn,
    userDetailQueryOptions,
    usersQueryOptions,
} from "@/functions/usersFn"
import { useMeOptions } from "@/hooks/authHooks"
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"

export const useCreateUser = () => {
    const q = getContext()
    return useMutation({
        mutationFn: createUserFn,
        onSuccess: () => {
            t.success("User added")
            q.invalidateQueries(usersQueryOptions())
        },
        onError: (error) => {
            t.error("Could not add user", { description: error.message })
        },
    })
}

export const useSetUserRole = () => {
    const q = getContext()
    return useMutation({
        mutationFn: setUserRoleFn,
        onSuccess: () => {
            t.success("Role updated")
            q.invalidateQueries({ queryKey: ["users"] })
        },
        onError: (error) => {
            t.error("Could not update role", { description: error.message })
        },
    })
}

export const useRemoveUser = () => {
    const q = getContext()
    return useMutation({
        mutationFn: removeUserFn,
        onSuccess: () => {
            t.success("User removed")
            q.invalidateQueries({ queryKey: ["users"] })
        },
        onError: (error) => {
            t.error("Could not remove user", { description: error.message })
        },
    })
}

export const useUserDetail = (userId: string | null) => {
    return useQuery(
        queryOptions({
            ...userDetailQueryOptions(userId ?? ""),
            enabled: Boolean(userId),
        })
    )
}

export const useBanUser = () => {
    const q = getContext()
    return useMutation({
        mutationFn: banUserFn,
        onSuccess: () => {
            t.success("User banned")
            q.invalidateQueries({ queryKey: ["users"] })
        },
        onError: (error) => {
            t.error("Could not ban user", { description: error.message })
        },
    })
}

export const useUnbanUser = () => {
    const q = getContext()
    return useMutation({
        mutationFn: unbanUserFn,
        onSuccess: () => {
            t.success("User unbanned")
            q.invalidateQueries({ queryKey: ["users"] })
        },
        onError: (error) => {
            t.error("Could not unban user", { description: error.message })
        },
    })
}

export const useRevokeUserSession = () => {
    const q = getContext()
    return useMutation({
        mutationFn: revokeUserSessionFn,
        onSuccess: () => {
            t.success("Session revoked")
            q.invalidateQueries({ queryKey: ["users"] })
        },
        onError: (error) => {
            t.error("Could not revoke session", { description: error.message })
        },
    })
}

export const useRevokeUserSessions = () => {
    const q = getContext()
    return useMutation({
        mutationFn: revokeUserSessionsFn,
        onSuccess: () => {
            t.success("All sessions revoked")
            q.invalidateQueries({ queryKey: ["users"] })
        },
        onError: (error) => {
            t.error("Could not revoke sessions", { description: error.message })
        },
    })
}

export const useSetUserPassword = () => {
    return useMutation({
        mutationFn: setUserPasswordFn,
        onSuccess: () => {
            t.success("Password updated")
        },
        onError: (error) => {
            t.error("Could not set password", { description: error.message })
        },
    })
}

export const useImpersonateUser = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: impersonateUserFn,
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
        mutationFn: stopImpersonatingFn,
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
