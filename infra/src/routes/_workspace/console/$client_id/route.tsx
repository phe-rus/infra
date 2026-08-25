import { createFileRoute, Outlet } from "@tanstack/react-router"
import { appOptions, CREATE_CLIENT_ID } from "@/domains/console"

export const Route = createFileRoute("/_workspace/console/$client_id")({
    loader: async ({ context: { q }, params: { client_id } }) => {
        // create-oauth2 is a reserved sentinel, never a real clientId — skip
        // the DB round-trip, findApp would just return null anyway
        if (client_id === CREATE_CLIENT_ID) return
        await q.ensureQueryData(appOptions(client_id))
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
