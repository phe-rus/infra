import { authMiddleware } from "@/middleware/auth.middleware"
import { createServerFn } from "@tanstack/react-start"
import { queryOptions, useMutation } from "@tanstack/react-query"
import { getContext } from "@/lib/queryClient"
import { authClient } from "@/lib/auth-client"
import { t } from "@infra/ui/components/sonner"
import { useRouter } from "@tanstack/react-router"
import { useAppMutation } from "@infra/ui/hooks/use-app-mutation"

export const currentUser = createServerFn()
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        return context.session
    })

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

// deleteUser is configured server-side (infra/src/auth/index.ts) with
// sendDeleteAccountVerification, so this call never deletes anything
// immediately — it always sends a confirmation email with a one-time link.
// Deletion only happens once that link is clicked; the session here stays
// valid until then.
export const useDeleteAccount = () =>
    useAppMutation({
        mutationFn: async (password: string) => {
            const { error } = await authClient.deleteUser({
                password,
                callbackURL: `${window.location.origin}/sign-in`,
            })
            if (error) throw new Error(error.message ?? "Could not start account deletion")
        },
        successMessage: "Check your email",
        successDescription:
            "We sent a link to confirm permanently deleting your account. It stays active until you click it.",
        errorMessage: "Could not start account deletion",
    })
