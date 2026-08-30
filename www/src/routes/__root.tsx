import tailwind from "@infra/ui/globals.css?url"
import { ThemeProvider } from "@infra/ui/theme"
import { ComposeViewport } from "@infra/ui/widgets/compose-viewport"
import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRoute,
} from "@tanstack/react-router"
import { organizationJsonLd, seo } from "@/lib/seo"

export const Route = createRootRoute({
    head: () => {
        const { meta, links } = seo({
            title: "Pherus",
            description:
                "Pherus is a research and innovation company built on Open Knowledge: understand the problem first, then share what was learned.",
        })

        return {
            meta: [
                {
                    charSet: "utf-8",
                },
                {
                    name: "viewport",
                    content:
                        "width=device-width, initial-scale=1",
                },
                { name: "robots", content: "index, follow" },
                ...meta,
            ],
            links: [
                {
                    rel: "stylesheet",
                    href: tailwind,
                },
                ...links,
            ],
            scripts: [
                {
                    type: "application/ld+json",
                    children: JSON.stringify(organizationJsonLd()),
                },
            ],
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
                </ThemeProvider>
                <ComposeViewport.Devtools />
                <Scripts />
            </ComposeViewport.Window>
        </ComposeViewport>
    )
}
