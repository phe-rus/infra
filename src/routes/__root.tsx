import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router"
import tailwind from "@/styles/globals.css?url"
import { cn } from "@/lib/utils"
import type { QueryClient } from "@tanstack/react-query"

export interface RouterAppContext {
  q: QueryClient
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Infra",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: tailwind
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en" className='antialiased blur-none dark' suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body
        id='root'
        className={cn(
          'relative min-h-dvh min-w-full border bg-background',
          'selection:bg-olive-500/15 overflow-x-hidden',
          'typeset wrap-anywhere duration-200',
          'flex flex-col'
        )}
      >
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
