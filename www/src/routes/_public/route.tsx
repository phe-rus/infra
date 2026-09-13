import { Toolbar } from "@/components/toolbar"
import {
    createFileRoute,
    Outlet,
} from "@tanstack/react-router"

export const Route = createFileRoute("/_public")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <Toolbar />
            <Outlet />
        </>
    )
}
