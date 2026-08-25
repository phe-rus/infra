import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_account")({
    loader: ({ context: { session } }) => {
        if (!session) {
            throw redirect({
                to: "/sign-in",
                replace: true,
                search: { reason: "session-expired" },
            })
        }
        return {
            user: session.user,
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
