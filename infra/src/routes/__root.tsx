import { meOptions, setupOptions } from "@/domains/auth"
import { seo } from "@/lib/seo"
import { ToasterProvider } from "@infra/ui/components/sonner"
import { DefaultLoader } from "@infra/ui/defaults"
import tailwind from "@infra/ui/globals.css?url"
import { ThemeProvider } from "@infra/ui/theme"
import { ComposeViewport } from "@infra/ui/widgets/compose-viewport"
import type { QueryClient } from "@tanstack/react-query"
import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRouteWithContext,
} from "@tanstack/react-router"

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
            { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
            { rel: "icon", type: "image/png", href: "/favicon.png" },
            { rel: "apple-touch-icon", href: "/favicon.svg" },
            { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
            { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            { rel: "preconnect", href: "https://fonts.gstatic.com" }
        ],
    }),
    beforeLoad: async ({ context }) => {
        const session = await context.q.query({
            ...meOptions(),
            staleTime: 'static'
        })
        const { hasAdmin } = await context.q.query({
            ...setupOptions(),
            staleTime: 'static'
        })
        return {
            session: session,
            hasAdmin: hasAdmin,
        }
    },
    pendingComponent: DefaultLoader,
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
                    <ToasterProvider />
                </ThemeProvider>
                <ComposeViewport.Devtools />
                <Scripts />
            </ComposeViewport.Window>
        </ComposeViewport>
    )
}
