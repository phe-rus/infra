import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { impersonateUser } from "./impersonate-user"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"

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
