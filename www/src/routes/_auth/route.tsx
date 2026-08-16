import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/_auth")({
    beforeLoad: async () => {
        const { data: session } = await authClient.getSession()
        if (session) throw redirect({
            to: '/',
            replace: true
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
