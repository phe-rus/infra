import { getLocale } from "@/paraglide/runtime"
import tailwind from "@infra/ui/globals.css?url"
import { ThemeProvider } from "@infra/ui/theme"
import { ComposeViewport } from "@infra/ui/widgets/compose-viewport"
import { LocaleSwitcher } from "@components/toolbars/views/locale-switcher"
import { organizationJsonLd, seo } from "@lib/seo"
import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRoute,
} from "@tanstack/react-router"

export const Route = createRootRoute({
    head: () => {
        const { meta, links } = seo({
            title: "Pherus - Practical research, sciences, innovation & technology",
            description:
                "Pherus is a practical research company exploring science, technology, and engineering to create innovative solutions that solve real-world problems. We build open technologies, conduct research, and turn ideas into practical tools that improve everyday life.",
            keywords: [
                "Pherus",
                "Research and technology company",
                "Identity and access",
                "Open source",
                "Science and research",
            ],
            canonical: false,
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
                {
                    rel: "icon",
                    type: "image/svg+xml",
                    href: "/favicon.svg",
                },
                {
                    rel: "apple-touch-icon",
                    href: "/favicon.svg",
                },
                {
                    rel: "manifest",
                    href: "/site.webmanifest",
                },
                ...links,
            ],
            scripts: [
                {
                    type: "application/ld+json",
                    children: JSON.stringify(
                        organizationJsonLd()
                    ),
                },
            ],
        }
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
                    <LocaleSwitcher />
                </ThemeProvider>
            </ComposeViewport.Window>
        </ComposeViewport>
    )
}
