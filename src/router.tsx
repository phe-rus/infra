import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { QueryProvider, getContext } from "@/lib/queryClient"
import { routeTree } from "@/routeTree.gen"

export function getRouter() {
  const q = getContext()
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
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

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
