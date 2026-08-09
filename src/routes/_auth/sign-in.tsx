import { createFileRoute, redirect } from "@tanstack/react-router"
import { AuthForm } from "@/components/auth"

export const Route = createFileRoute("/_auth/sign-in")({
    loader: async ({ context: { hasOwner } }) => {
        if (!hasOwner) throw redirect({ to: "/setup", replace: true })
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <AuthForm mode="sign-in" />
}
