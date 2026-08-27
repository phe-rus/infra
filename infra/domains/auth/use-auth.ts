import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"
import { useAppMutation } from "@infra/ui/hooks"
import { getContext } from "@/lib/queryClient"
import { t } from "@infra/ui/components/sonner"
import { meOptions, setupOptions } from "./get-auth"
import type {
    forgotPasswordSchema,
    resetPasswordSchema,
    setupSchema,
    signInSchema,
} from "./types"
import type { z } from "zod"

export const useSignIn = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: (input: z.infer<typeof signInSchema>) =>
            authClient.signIn.email({
                email: input.email,
                password: input.password,
                rememberMe: input.rememberMe,
                callbackURL: window.location.origin,
            }),
        onSuccess: ({ data, error }) => {
            if (error) {
                t.error("Sign in failed", {
                    description: error.message,
                })
                return
            }
            t.success("Signed in", {
                description: "You have been signed in successfully",
                duration: 2000,
            })
            q.clear()
            const redirectUri = (
                data as { redirect_uri?: string } | undefined
            )?.redirect_uri
            if (redirectUri) {
                window.location.href = redirectUri
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
        mutationFn: () => authClient.signOut(),
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
        mutationFn: (input: z.infer<typeof setupSchema>) =>
            authClient.signUp.email({
                name: input.name,
                email: input.email,
                password: input.password,
                callbackURL: window.location.origin,
            }),
        onSuccess: ({ error }) => {
            if (error) {
                t.error("Setup failed", {
                    description: error.message,
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
        mutationFn: async (input: z.infer<typeof forgotPasswordSchema>) => {
            const { error } = await authClient.requestPasswordReset({
                email: input.email,
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) {
                throw new Error(error.message ?? "Could not send reset email")
            }
        },
        successMessage: "Check your email",
        successDescription:
            "If that email exists, a reset link is on its way.",
        errorMessage: "Could not send reset email",
    })

export const useResetPassword = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: (input: z.infer<typeof resetPasswordSchema>) =>
            authClient.resetPassword({
                newPassword: input.newPassword,
                token: input.token,
            }),
        onSuccess: ({ error }) => {
            if (error) {
                t.error("Could not reset password", {
                    description: error.message,
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
