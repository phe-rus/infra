import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { meQueryOptions, setupStatusQueryOptions } from "@/kit/auth"
import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"
import tailwind from "@infra/ui/globals.css?url"
import { ThemeProvider } from '@infra/ui/theme'
import { cn } from "@infra/ui/lib/utils"
import { seo } from "@/lib/seo"
import { ToasterProvider } from "@infra/ui/components/sonner"

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
      ...seo({
        siteName: 'Infra',
        title: 'Infra',
        description: 'Manage your infrastructure with ease.'
      })
    ],
    links: [
      {
        rel: "stylesheet",
        href: tailwind
      },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const session = await context.q.ensureQueryData(
      meQueryOptions()
    )
    const { hasOwner } = await context.q.ensureQueryData(
      setupStatusQueryOptions()
    )
    return {
      session: session,
      hasOwner: hasOwner
    }
  },
  shellComponent: RootDocument
})

function RootDocument() {
  return (
    <html lang="en" className='antialiased blur-none' suppressHydrationWarning>
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
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
        >
          <Outlet />
          <ToasterProvider richColors />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: 'TanStack Query',
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
