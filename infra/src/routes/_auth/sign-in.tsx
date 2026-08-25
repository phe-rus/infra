import { createFileRoute, redirect } from "@tanstack/react-router"
import { Login } from "@/domains/auth/views/login"
import { t } from "@infra/ui/components/sonner"
import { useEffect } from "react"
import { signInSearchSchema } from "@/domains/auth"

export const Route = createFileRoute("/_auth/sign-in")({
    validateSearch: signInSearchSchema,
    loader: async ({ context: { hasAdmin } }) => {
        if (!hasAdmin) throw redirect({ to: "/setup", replace: true })
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

    return <Login />
}
