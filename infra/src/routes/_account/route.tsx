import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

// any signed-in user, no role/tier check — mirrors _workspace's own-session
// gate but drops the isAdminTier check, since this is the one place a plain
// `user` role account (who can never reach _workspace) gets a shell of its
// own
export const Route = createFileRoute("/_account")({
    beforeLoad: ({ context: { session } }) => {
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
