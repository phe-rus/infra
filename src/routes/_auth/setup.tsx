import { createFileRoute, redirect } from "@tanstack/react-router"
import { AuthForm } from "@/components/auth"
import { getSession, getSetupStatus } from "@/functions/authFn"

export const Route = createFileRoute("/_auth/setup")({
    beforeLoad: async () => {
        const session = await getSession()
        if (session) throw redirect({ to: "/" })

        const { hasOwner } = await getSetupStatus()
        if (hasOwner) throw redirect({ to: "/sign-in" })
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <AuthForm mode="setup" />
}
