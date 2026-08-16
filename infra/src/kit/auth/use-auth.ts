import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import {
    completeSetup,
    createAccount,
    requestPasswordReset,
    resetPassword,
    runSetupMigrations,
    signIn,
    signOut,
    submitConsent,
} from "./fnc"
import { useAppMutation } from "@/kit/shared"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"
import { meQueryOptions, setupStatusQueryOptions } from "./get-auth"

export const useSignIn = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: signIn,
        onSuccess: (data) => {
            if (data.error) {
                t.error("Sign in failed", { description: data.error })
                return
            }
            t.success("Signed in", {
                description: "You have been signed in successfully",
                duration: 2000,
            })
            q.clear()
            // mid-OAuth-authorize-flow: hand the browser back to the
            // connecting application instead of landing on the dashboard
            if (data.redirectUri) {
                window.location.href = data.redirectUri
                return
            }
            q.prefetchQuery(meQueryOptions())
            setTimeout(() => {
                router.navigate({ to: "/", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Sign in failed", { description: error.message })
        },
    })
}

export const useCreateAccount = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: createAccount,
        onSuccess: (data) => {
            if (data.error) {
                t.error("Could not create account", { description: data.error })
                return
            }
            if (data.needsVerification) {
                t.success("Check your email", {
                    description: "Verify your address, then sign in to continue.",
                    duration: 4000,
                })
                router.navigate({ to: "/sign-in", replace: true })
                return
            }
            t.success("Account created", {
                description: "You have been signed in successfully",
                duration: 2000,
            })
            q.clear()
            // mid-OAuth-authorize-flow: hand the browser back to the
            // connecting application instead of landing on the dashboard
            if (data.redirectUri) {
                window.location.href = data.redirectUri
                return
            }
            q.prefetchQuery(meQueryOptions())
            setTimeout(() => {
                router.navigate({ to: "/", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Could not create account", { description: error.message })
        },
    })
}

export const useLogout = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: signOut,
        onSuccess: () => {
            t.success("Signed out", {
                description: "You have been signed out successfully",
                duration: 2000,
            })
            q.invalidateQueries(meQueryOptions())
            q.clear()
            setTimeout(() => {
                router.navigate({ to: "/sign-in", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Sign out failed", { description: error.message })
        },
    })
}

export const useCompleteSetup = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: completeSetup,
        onSuccess: (data) => {
            if (data.error) {
                t.error("Setup failed", { description: data.error })
                return
            }
            t.success("Setup complete", {
                description: "Welcome to Infra.",
                duration: 2000,
            })
            q.clear()
            q.invalidateQueries(meQueryOptions())
            q.invalidateQueries(setupStatusQueryOptions())
            q.prefetchQuery(meQueryOptions())
            q.prefetchQuery(setupStatusQueryOptions())
            setTimeout(() => {
                router.navigate({ to: "/", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Setup failed", { description: error.message })
        },
    })
}

export const useRunSetupMigrations = () =>
    useAppMutation({
        mutationFn: () => runSetupMigrations(),
        errorMessage: "Could not prepare the database",
    })

export const useRequestPasswordReset = () =>
    useMutation({
        mutationFn: requestPasswordReset,
        onSuccess: (data) => {
            t.success("Check your email", { description: data.message })
        },
        onError: (error) => {
            t.error("Could not send reset email", { description: error.message })
        },
    })

export const useResetPassword = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: resetPassword,
        onSuccess: (data) => {
            if (data.error) {
                t.error("Could not reset password", { description: data.error })
                return
            }
            t.success("Password reset", { description: "Sign in with your new password." })
            setTimeout(() => {
                router.navigate({ to: "/sign-in", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Could not reset password", { description: error.message })
        },
    })
}

// mirrors useSignIn: this either redirects the browser back to the
// connecting application or (on deny) leaves the caller to navigate away
// itself, so it bypasses useAppMutation's own-app cache invalidation
export const useSubmitConsent = () =>
    useMutation({
        mutationFn: submitConsent,
        onError: (error) => {
            t.error("Could not submit consent", { description: error.message })
        },
    })
