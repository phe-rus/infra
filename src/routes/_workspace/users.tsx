import { createFileRoute, redirect } from "@tanstack/react-router"
import { usersQueryOptions } from "@/kit/hypermedia/users"
import { isAdminTier } from "@/auth/permissions"
import { UsersPage } from "@/features/users"

export const Route = createFileRoute("/_workspace/users")({
    beforeLoad: ({ context: { user } }) => {
        if (!isAdminTier(user.role ?? "")) {
            throw redirect({ to: "/unauthorized", replace: true })
        }
    },
    loader: async ({ context: { q } }) => {
        await q.ensureQueryData(usersQueryOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { user } = Route.useRouteContext()
    return <UsersPage currentUserId={user.id} currentUserRole={user.role ?? ""} />
}
