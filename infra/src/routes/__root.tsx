import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router"
import { meQueryOptions, setupStatusQueryOptions } from "@/domains/auth"
import { ToasterProvider } from "@infra/ui/components/sonner"
import type { QueryClient } from "@tanstack/react-query"
import { ComposeViewport } from "@/components/views"
import tailwind from "@infra/ui/globals.css?url"
import { ThemeProvider } from "@infra/ui/theme"
import { seo } from "@/lib/seo"

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
                siteName: "Infra",
                title: "Infra",
                description: "Manage your infrastructure with ease.",
            }),
        ],
        links: [
            {
                rel: "stylesheet",
                href: tailwind,
            },
        ],
    }),
    beforeLoad: async ({ context }) => {
        const session = await context.q.ensureQueryData(meQueryOptions())
        const { hasOwner } = await context.q.ensureQueryData(setupStatusQueryOptions())
        return {
            session: session,
            hasOwner: hasOwner,
        }
    },
    shellComponent: RootDocument,
})

function RootDocument() {
    return (
        <ComposeViewport>
            <head>
                <HeadContent />
            </head>
            <ComposeViewport.Window>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    disableTransitionOnChange
                    enableColorScheme
                    enableSystem
                >
                    <Outlet />
                    <ToasterProvider richColors />
                </ThemeProvider>
                <ComposeViewport.Devtools />
                <Scripts />
            </ComposeViewport.Window>
        </ComposeViewport>
    )
}
