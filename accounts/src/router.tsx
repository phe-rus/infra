import { QueryProvider, getContext } from "@/lib/queryClient"
import {
    DefaultBoundary,
    DefaultLoader,
    NotFound,
} from "@infra/ui/defaults"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import {
    deLocalizeUrl,
    localizeUrl,
} from "./paraglide/runtime"
import { routeTree } from "./routeTree.gen"

// the default serializer JSON-encodes values and folds repeated keys into
// a JSON array, rewriting better-auth's signed oauth query
// (ba_param=a&ba_param=b becomes ba_param=["a","b"]) so its sig no longer
// verifies. keep every value a plain string and repeated keys repeated.
function parseSearch(search: string) {
    const params = new URLSearchParams(search)
    const result: Record<string, string | string[]> = {}
    for (const key of new Set(params.keys())) {
        const values = params.getAll(key)
        result[key] = values.length > 1 ? values : values[0]
    }
    return result
}

function stringifySearch(search: Record<string, unknown>) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(search)) {
        if (value === undefined || value === null) continue
        for (const item of Array.isArray(value) ? value : [value]) {
            params.append(key, String(item))
        }
    }
    const query = params.toString()
    return query ? `?${query}` : ""
}

export function getRouter() {
    const queryClient = getContext()
    const router = createTanStackRouter({
        routeTree,
        context: {
            queryClient,
        },
        parseSearch,
        stringifySearch,
        scrollRestoration: true,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        defaultPendingComponent: DefaultLoader,
        defaultErrorComponent: DefaultBoundary,
        defaultNotFoundComponent: () => <NotFound />,
        rewrite: {
            input: ({ url }) => deLocalizeUrl(url),
            output: ({ url }) => localizeUrl(url),
        },
        Wrap: ({ children }) => {
            return (
                <QueryProvider queryClient={queryClient}>
                    {children}
                </QueryProvider>
            )
        },
    })

    setupRouterSsrQueryIntegration({
        queryClient,
        router: router,
    })

    return router
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
