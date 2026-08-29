import tailwind from "@infra/ui/globals.css?url"
import { ThemeProvider } from "@infra/ui/theme"
import { ComposeViewport } from "@infra/ui/widgets/compose-viewport"
import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRoute,
} from "@tanstack/react-router"

export const Route = createRootRoute({
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
            {
                title: "Pherus",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: tailwind,
            },
        ],
    }),
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
                </ThemeProvider>
                <ComposeViewport.Devtools />
                <Scripts />
            </ComposeViewport.Window>
        </ComposeViewport>
    )
}
