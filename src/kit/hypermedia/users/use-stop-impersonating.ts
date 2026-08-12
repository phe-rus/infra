import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { stopImpersonating } from "./stop-impersonating"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"
import { meQueryOptions } from "@/kit/auth"

export const useStopImpersonating = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: stopImpersonating,
        onSuccess: () => {
            t.success("Back to your account")
            q.clear()
            q.prefetchQuery(meQueryOptions())
            setTimeout(() => {
                router.navigate({ to: "/", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Could not stop impersonating", { description: error.message })
        },
    })
}
