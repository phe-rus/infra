import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_workspace/settings")({
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
