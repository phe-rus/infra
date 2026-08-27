import { Dashboard } from "@/components/asidebar/asidebar"
import { protectedOptions } from "@/domains/auth/get-auth"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_workspace")({
    beforeLoad: async ({ context: { q } }) => {
        const session = await q.query({
            ...protectedOptions(),
            staleTime: 'static'
        })
        return {
            session,
            user: session.user,
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <Dashboard>
            <Outlet />
        </Dashboard>
    )
}
