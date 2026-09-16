import {
    deLocalizeUrl,
    localizeUrl,
} from "@/paraglide/runtime"
import { getContext, QueryProvider } from "@hooks/queryClient"
import { NotFound } from "@infra/ui/defaults"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
    const queryClient = getContext()
    const router = createTanStackRouter({
        routeTree,
        scrollRestoration: true,
        defaultPreload: "intent",
        defaultNotFoundComponent: () => <NotFound />,
        rewrite: {
            input: ({ url }) => deLocalizeUrl(url),
            output: ({ url }) => localizeUrl(url),
        },
        Wrap: ({ children }) => {
            return (
                <QueryProvider query={queryClient}>
                    {children}
                </QueryProvider>
            )
        }
    })

    setupRouterSsrQueryIntegration({
        queryClient: queryClient,
        router: router,
    })

    return router
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
