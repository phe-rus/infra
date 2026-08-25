import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { consoleOptions } from "@/domains/console"
import { isAdminTier } from "@infra/auth/permissions"

export const Route = createFileRoute("/_workspace/console")({
    beforeLoad: ({ context: { user } }) => {
        if (!isAdminTier(user.role ?? "")) {
            throw redirect({
                to: "/unauthorized",
                replace: true,
            })
        }
    },
    loader: async ({ context: { q } }) => {
        await q.ensureQueryData(consoleOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
