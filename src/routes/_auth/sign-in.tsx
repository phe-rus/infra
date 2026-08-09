import { createFileRoute, redirect } from "@tanstack/react-router"
import { AuthForm } from "@/components/auth"
import { getSession, getSetupStatus } from "@/functions/authFn"

export const Route = createFileRoute("/_auth/sign-in")({
    beforeLoad: async () => {
        const session = await getSession()
        if (session) throw redirect({ to: "/" })

        const { hasOwner } = await getSetupStatus()
        if (!hasOwner) throw redirect({ to: "/setup" })
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <AuthForm mode="sign-in" />
}
