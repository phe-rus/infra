import { createFileRoute, Outlet } from "@tanstack/react-router"
import { appOptions, CREATE_CLIENT_ID } from "@/domains/console"

export const Route = createFileRoute("/_workspace/console/$client_id")({
    loader: async ({ context: { q }, params: { client_id } }) => {
        if (client_id === CREATE_CLIENT_ID) return
        await q.query({ ...appOptions(client_id), staleTime: 'static' })
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
