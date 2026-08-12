import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { completeSetup } from "./complete-setup"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"
import { meQueryOptions } from "./me-query-options"
import { setupStatusQueryOptions } from "./setup-status-query-options"

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
