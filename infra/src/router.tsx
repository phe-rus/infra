import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { DefaultBoundary, DefaultLoader, NotFound } from '@infra/ui/defaults'
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { QueryProvider, getContext } from "@/lib/queryClient"
import { routeTree } from "@/routeTree.gen"

export function getRouter() {
  const q = getContext()
  const router = createTanStackRouter({
    routeTree,
    context: {
      q: q
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPendingComponent: DefaultLoader,
    defaultErrorComponent: DefaultBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    Wrap: ({ children }) => {
      return (
        <QueryProvider query={q}>
          <>
            {children}
          </>
        </QueryProvider>
      )
    }
  })

  setupRouterSsrQueryIntegration({
    queryClient: q,
    router: router
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
