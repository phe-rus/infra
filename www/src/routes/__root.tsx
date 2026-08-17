import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import tailwind from "@infra/ui/globals.css?url"
import { ThemeProvider } from "@infra/ui/theme"
import { cn } from "@infra/ui/lib/utils"
import { currentOptions } from "@/functions/get-auth"
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
            {
                title: "Infraccount",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: tailwind,
            },
        ],
    }),
    beforeLoad: async ({ context: { q } }) => {
        const session = await q.ensureQueryData(currentOptions())
        return { session: session }
    },
    shellComponent: RootDocument,
})

function RootDocument() {
    return (
        <html lang="en" className="antialiased blur-none" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body
                id="root"
                className={cn(
                    "relative min-h-dvh min-w-full border bg-background",
                    "overflow-x-hidden selection:bg-olive-500/15",
                    "typeset wrap-anywhere duration-200",
                    "flex flex-col"
                )}
            >
                <ThemeProvider attribute="class" defaultTheme="system">
                    <Outlet />
                    <ToasterProvider richColors />
                </ThemeProvider>
                <Scripts />
            </body>
        </html>
    )
}
