import { authMiddleware } from "@/middleware/auth.middleware"
import { createServerFn } from "@tanstack/react-start"
import { queryOptions, useMutation } from "@tanstack/react-query"
import { getContext } from "@/lib/queryClient"
import { authClient } from "@/lib/auth-client"
import { t } from "@infra/ui/components/sonner"
import { useRouter } from "@tanstack/react-router"

export const currentUser = createServerFn()
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        return context.session
    })

export const currentOptions = () => queryOptions({
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
            t.success('Successfully', {
                description: 'Logout successfully!'
            })
            await queryClient.invalidateQueries(
                currentOptions()
            )
            await router.navigate({
                to: '/',
                replace: true,
                reloadDocument: true,
            })
        },
        onError: (error) => {
            t.error(error.name, {
                description: error.message
            })
        }
    })
}