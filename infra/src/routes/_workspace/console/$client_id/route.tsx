import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_workspace/console/$client_id")({
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
