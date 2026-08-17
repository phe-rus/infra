import { authMiddleware } from "@/middleware/auth.middleware"
import { createServerFn } from "@tanstack/react-start"
import { queryOptions, useMutation } from "@tanstack/react-query"
import { getContext } from "@/lib/queryClient"
import { authClient } from "@/lib/auth-client"
import { t } from "@infra/ui/components/sonner"

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
    return useMutation({
        mutationFn: async () => {
            return await authClient.signOut()
        },
        onSuccess: () => {
            t.success('Successfully', {
                description: 'Logout successfully!'
            })
            void queryClient.invalidateQueries(currentOptions())
        },
        onError: (error) => {
            t.error(error.name, {
                description: error.message
            })
        }
    })
}