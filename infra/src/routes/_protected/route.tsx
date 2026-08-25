import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_protected")({
    beforeLoad: ({ context: { session } }) => {
        if (!session) throw redirect({ to: "/sign-in", replace: true })
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
