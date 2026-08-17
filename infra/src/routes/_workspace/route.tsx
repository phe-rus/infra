import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { isAdminTier } from "@/auth/utils/permissions"
import { Dashboard } from "@/components/dashboard"

export const Route = createFileRoute("/_workspace")({
    beforeLoad: ({ context: { session } }) => {
        if (!session)
            throw redirect({
                to: "/sign-in",
                replace: true,
                search: { reason: "session-expired" },
            })

        if (!isAdminTier(session.user.role ?? "")) {
            throw redirect({ to: "/unauthorized", replace: true })
        }

        return {
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
