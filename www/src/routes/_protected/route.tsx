import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_protected")({
    beforeLoad: ({ location, context }) => {
        if (!context.session) {
            throw redirect({
                href: `/sign-in${location.searchStr}`,
                replace: true,
            })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
