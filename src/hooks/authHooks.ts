import { getSession, getSetupStatus, signInEmail, signOutUser } from "@/functions/authFn"
import { queryOptions, useMutation } from "@tanstack/react-query"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"
import { useRouter } from "@tanstack/react-router"

export const useMeOptions = () => queryOptions({
    queryKey: ['me'],
    queryFn: () => getSession()
})

export const useSetupOptions = () => queryOptions({
    queryKey: ["setup"],
    queryFn: getSetupStatus
})

export const useSignIn = () => {
    const router = useRouter()
    const q = getContext()
    return useMutation({
        mutationFn: signInEmail,
        onSuccess: (data) => {
            if (data.error) {
                t.error("Sign in failed", { description: data.error })
                return
            }
            t.success("Signed in", {
                description: "You have been signed in successfully",
                duration: 2000
            })
            q.clear()
            q.prefetchQuery(useMeOptions())
            setTimeout(() => {
                router.navigate({ to: '/', replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Sign in failed", {
                description: error.message
            })
        }
    })
}

export const useLogout = () => {
    const router = useRouter()
    const q = getContext()

    return useMutation({
        mutationFn: signOutUser,
        onSuccess: () => {
            t.success("Signed out", {
                description: "You have been signed out successfully",
                duration: 2000
            })
            q.invalidateQueries(useMeOptions())
            q.clear()
            setTimeout(() => {
                router.navigate({ to: '/sign-in', replace: true })
            }, 50)
        },
        onError: (error) => {
            t.error("Sign out failed", {
                description: error.message
            })
        }
    })
}