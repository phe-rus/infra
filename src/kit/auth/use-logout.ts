import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { signOut } from "./sign-out"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"
import { meQueryOptions } from "./me-query-options"

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
