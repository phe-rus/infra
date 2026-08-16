import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
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
