import { meOptions, setupOptions } from "@/domains/auth"
import {
    instanceSettingsOptions,
    useInstanceSettings,
} from "@/domains/settings"
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
import { useEffect } from "react"

export interface RouterAppContext {
    q: QueryClient
}

export const Route =
    createRootRouteWithContext<RouterAppContext>()({
        head: () => ({
            meta: [
                {
                    charSet: "utf-8",
                },
                {
                    name: "viewport",
                    content:
                        "width=device-width, initial-scale=1",
                },
                ...seo({
                    siteName: "Infra",
                    title: "Infra",
                    description:
                        "Manage your infrastructure with ease.",
                }),
            ],
            links: [
                {
                    rel: "stylesheet",
                    href: tailwind,
                },
                {
                    rel: "icon",
                    type: "image/svg+xml",
                    href: "/favicon.svg",
                },
                {
                    rel: "icon",
                    type: "image/png",
                    href: "/favicon.png",
                },
                {
                    rel: "apple-touch-icon",
                    href: "/favicon.svg",
                },
                {
                    rel: "dns-prefetch",
                    href: "https://fonts.googleapis.com",
                },
                {
                    rel: "dns-prefetch",
                    href: "https://fonts.gstatic.com",
                },
                {
                    rel: "preconnect",
                    href: "https://fonts.googleapis.com",
                },
                {
                    rel: "preconnect",
                    href: "https://fonts.gstatic.com",
                },
            ],
        }),
        beforeLoad: async ({ context }) => {
            const session = await context.q.query({
                ...meOptions(),
                staleTime: "static",
            })
            const { hasAdmin } = await context.q.query({
                ...setupOptions(),
                staleTime: "static",
            })
            // fetched once here (a short in-memory memo on the server side
            // keeps this cheap), so every page under both _auth and
            // _workspace gets it from the query cache, not a fetch each
            await context.q.query({
                ...instanceSettingsOptions(),
                staleTime: "static",
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
    const { data: settings } = useInstanceSettings()

    // head() above is static (this codebase has no per-route dynamic head
    // yet), so the tab title/favicon are set client side once branding is
    // known; the static defaults ("Infra", the static favicon files) are
    // what render until then, matching the fallback an unset instance shows
    useEffect(() => {
        document.title = settings.displayName
    }, [settings.displayName])

    useEffect(() => {
        if (!settings.faviconUrl) return
        const links =
            document.querySelectorAll<HTMLLinkElement>(
                'link[rel="icon"], link[rel="apple-touch-icon"]'
            )
        for (const link of links) {
            link.href = settings.faviconUrl
        }
    }, [settings.faviconUrl])

    return (
        <ComposeViewport>
            <head>
                <HeadContent />
            </head>
            <ComposeViewport.Window
                after={
                    <>
                        <ComposeViewport.Devtools />
                        <Scripts />
                    </>
                }
            >
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
            </ComposeViewport.Window>
        </ComposeViewport>
    )
}
