import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { signIn } from "./fnc"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"
import { meQueryOptions } from "./get-session"

export const useSignIn = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: signIn,
        onSuccess: (data) => {
            if (data.error) {
                t.error("Sign in failed", { description: data.error })
                return
            }
            t.success("Signed in", {
                description: "You have been signed in successfully",
                duration: 2000,
            })
            q.clear()
            q.prefetchQuery(meQueryOptions())
            setTimeout(() => {
                router.navigate({ to: "/", replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Sign in failed", { description: error.message })
        },
    })
}
