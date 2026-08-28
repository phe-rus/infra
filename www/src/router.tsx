import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { NotFound } from "@infra/ui/defaults"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
    const router = createTanStackRouter({
        routeTree,
        scrollRestoration: true,
        defaultPreload: "intent",
        defaultNotFoundComponent: () => <NotFound />,
    })

    return router
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
