import { createFileRoute, redirect } from "@tanstack/react-router"
import { AuthForm } from "@/components/auth"
import { t } from "@/components/ui/sonner"
import { useEffect } from "react"
import { signInSearchSchema } from "@/schemas/auth"

export const Route = createFileRoute("/_auth/sign-in")({
    validateSearch: signInSearchSchema,
    loader: async ({ context: { hasOwner } }) => {
        if (!hasOwner) throw redirect({ to: "/setup", replace: true })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { reason } = Route.useSearch()

    useEffect(() => {
        if (reason === "session-expired") {
            t.error("Signed out", { description: "Sign in again to continue" })
        }
    }, [reason])

    return <AuthForm />
}
