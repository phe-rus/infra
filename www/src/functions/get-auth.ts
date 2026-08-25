import { authMiddleware } from "@/middleware/auth.middleware"
import { createServerFn } from "@tanstack/react-start"
import { queryOptions, useMutation } from "@tanstack/react-query"
import { getContext } from "@/lib/queryClient"
import { authClient } from "@/lib/auth-client"
import { t } from "@infra/ui/components/sonner"
import { useRouter } from "@tanstack/react-router"
import { useAppMutation } from "@infra/ui/hooks"

export const currentUser = createServerFn()
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        return context.session
    })

export type CurrentUserData = Awaited<ReturnType<typeof currentUser>>

export const currentOptions = () =>
    queryOptions({
        queryKey: ["me"],
        queryFn: () => currentUser(),
    })

export const useLogout = () => {
    const queryClient = getContext()
    const router = useRouter()

    return useMutation({
        mutationFn: async () => {
            return await authClient.signOut()
        },
        onSuccess: async () => {
            t.success("Successfully", {
                description: "Logout successfully!",
            })
            await queryClient.invalidateQueries(currentOptions())
            await router.navigate({
                to: "/",
                replace: true,
                reloadDocument: true,
            })
        },
        onError: (error) => {
            t.error(error.name, {
                description: error.message,
            })
        },
    })
}

export const useRequestPasswordReset = () =>
    useMutation({
        mutationFn: async (email: string) => {
            const { error } = await authClient.requestPasswordReset({
                email,
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error)
                throw new Error(error.message ?? "Could not send reset email")
        },
        onSuccess: () => {
            t.success("Check your email", {
                description:
                    "If that email exists, a reset link is on its way.",
            })
        },
        onError: (error) => {
            t.error("Could not send reset email", {
                description: error.message,
            })
        },
    })

export const useResetPassword = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: async (input: { newPassword: string; token: string }) => {
            const { error } = await authClient.resetPassword({
                newPassword: input.newPassword,
                token: input.token,
            })
            if (error)
                throw new Error(error.message ?? "Could not reset password")
        },
        onSuccess: () => {
            t.success("Password reset", {
                description: "Sign in with your new password.",
            })
            setTimeout(() => {
                router.navigate({ to: "/sign-in", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Could not reset password", { description: error.message })
        },
    })
}

export const useDeleteAccount = () =>
    useAppMutation({
        mutationFn: async (password: string) => {
            const { error } = await authClient.deleteUser({
                password,
                callbackURL: `${window.location.origin}/sign-in`,
            })
            if (error)
                throw new Error(
                    error.message ?? "Could not start account deletion"
                )
        },
        successMessage: "Check your email",
        successDescription:
            "We sent a link to confirm permanently deleting your account. It stays active until you click it.",
        errorMessage: "Could not start account deletion",
    })
