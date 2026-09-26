import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRouteWithContext,
} from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import tailwind from "@infra/ui/globals.css?url"
import { ThemeProvider } from "@infra/ui/theme"
import { currentOptions } from "@/domains/auth"
import { seo } from "@/lib/seo"
import { ToasterProvider } from "@infra/ui/components/sonner"
import { ComposeViewport } from "@infra/ui/widgets/compose-viewport"
import { getLocale } from "../paraglide/runtime"
import { LocaleSwitcher } from "@/components/locale-switcher"

export interface RouterAppContext {
    queryClient: QueryClient
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
                    siteName: "Account",
                    title: "Account",
                    description:
                        "Sign in and manage your account.",
                }),
            ],
            links: [
                {
                    rel: "stylesheet",
                    href: tailwind,
                },
                {
                    rel: "icon",
                    href: "/favicon.ico",
                },
                {
                    rel: "manifest",
                    href: "/manifest.json",
                },
            ],
        }),
        beforeLoad: async ({ context: { queryClient } }) => {
            const session = await queryClient.query({
                ...currentOptions(),
                staleTime: "static",
            })
            return { session: session }
        },
        shellComponent: RootDocument,
    })

function RootDocument() {
    return (
        <ComposeViewport lang={getLocale()}>
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
                    <LocaleSwitcher />
                </ThemeProvider>
            </ComposeViewport.Window>
        </ComposeViewport>
    )
}
