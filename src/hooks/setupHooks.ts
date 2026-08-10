import { completeSetup } from "@/functions/setupFn"
import { useMutation } from "@tanstack/react-query"
import { useMeOptions, useSetupOptions } from "./authHooks"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"
import { useRouter } from "@tanstack/react-router"

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
                duration: 2000
            })
            q.clear()
            q.invalidateQueries(useMeOptions())
            q.invalidateQueries(useSetupOptions())
            q.prefetchQuery(useMeOptions())
            q.prefetchQuery(useSetupOptions())
            setTimeout(() => {
                router.navigate({ to: '/', replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Setup failed", {
                description: error.message
            })
        }
    })
}
