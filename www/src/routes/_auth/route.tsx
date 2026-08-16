import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth")({
    loader: async ({ context: { session } }) => {
        if (session) {
            throw redirect({
                to: '/',
                replace: true
            })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
