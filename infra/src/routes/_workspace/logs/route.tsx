import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { isAdminTier } from "@/auth"

export const Route = createFileRoute("/_workspace/logs")({
    loader: ({ context: { user } }) => {
        if (!isAdminTier(user.role ?? "")) {
            throw redirect({
                to: "/unauthorized",
                replace: true,
            })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
