import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import {
    completeSetup,
    requestPasswordReset,
    resetPassword,
    signIn,
    signOut,
} from "./func"
import { useAppMutation } from "@infra/ui/hooks"
import { getContext } from "@/lib/queryClient"
import { t } from "@infra/ui/components/sonner"
import { meOptions, setupOptions } from "./get-auth"

export const useSignIn = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: signIn,
        onSuccess: (data) => {
            if (data.error) {
                t.error("Sign in failed", {
                    description: data.error,
                })
                return
            }
            t.success("Signed in", {
                description: "You have been signed in successfully",
                duration: 2000,
            })
            q.clear()
            if (data.redirectUri) {
                window.location.href = data.redirectUri
                return
            }
            q.prefetchQuery(meOptions())
            setTimeout(() => {
                router.navigate({ to: "/", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Sign in failed", {
                description: error.message,
            })
        },
    })
}

export const useLogout = () => {
    const router = useRouter()
    const q = getContext()
    return useAppMutation({
        mutationFn: signOut,
        successMessage: "Signed out",
        successDescription: "You have been signed out successfully",
        onSuccess: () => {
            q.invalidateQueries(meOptions())
            q.clear()
            setTimeout(() => {
                router.navigate({
                    to: "/sign-in",
                    replace: true,
                })
            }, 50)
        },
        errorMessage: "Sign out failed",
    })
}

export const useCompleteSetup = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: completeSetup,
        onSuccess: (data) => {
            if (data.error) {
                t.error("Setup failed", {
                    description: data.error,
                })
                return
            }
            t.success("Account created", {
                description: "Signed in as the first admin account.",
            })
            q.invalidateQueries(setupOptions())
            setTimeout(() => {
                router.navigate({
                    to: "/",
                    replace: true,
                    reloadDocument: true,
                })
            }, 50)
        },
        onError: (error) => {
            t.error("Setup failed", {
                description: error.message,
            })
        },
    })
}

export const useRequestPasswordReset = () =>
    useAppMutation({
        mutationFn: requestPasswordReset,
        successMessage: "Check your email",
        successDescription: (data) => data.message,
        errorMessage: "Could not send reset email",
    })

export const useResetPassword = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: resetPassword,
        onSuccess: (data) => {
            if (data.error) {
                t.error("Could not reset password", {
                    description: data.error,
                })
                return
            }
            t.success("Password reset", {
                description: "Sign in with your new password.",
            })
            setTimeout(() => {
                router.navigate({
                    to: "/sign-in",
                    replace: true,
                })
            }, 50)
        },
        onError: (error) => {
            t.error("Could not reset password", {
                description: error.message,
            })
        },
    })
}
