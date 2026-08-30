import { TanStackDevtools } from "@tanstack/react-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from "react"
import { cn } from "../../lib/utils"

type ComposeViewportProps = PropsWithChildren<{
    className?: string
}>

type WindowProps = ComponentPropsWithoutRef<"body"> & {
    /**
     * Rendered as direct `<body>` children, after `<main>`, not inside it.
     * `<Scripts />` (and devtools) belong here — TanStack Router's own docs
     * say `<Scripts />` "should be placed near the end of the document
     * body", not nested inside the app's content wrapper.
     */
    after?: ReactNode
}

export function ComposeViewport({ children }: ComposeViewportProps) {
    return (
        <html
            lang="en"
            className="antialiased blur-none"
            suppressHydrationWarning
        >
            {children}
        </html>
    )
}

function Window({ className, children, after, ...props }: WindowProps) {
    return (
        <body
            className={cn(
                "fixed h-svh min-w-full border bg-background",
                "overflow-x-hidden selection:bg-olive-500/15",
                "typeset wrap-anywhere duration-200",
                "flex flex-col",
                className
            )}
            {...props}
        >
            <main className={cn(
                "flex-1 min-h-svh overflow-auto",
                'no-scrollbar'
            )}>
                {children}
            </main>
            {after}
        </body>
    )
}

function Devtools() {
    return (
        <TanStackDevtools
            config={{
                triggerMode: "floating",
                position: "top-right",
            }}
            plugins={[
                {
                    name: "TanStack Query",
                    render: <ReactQueryDevtoolsPanel />,
                },
                {
                    name: "Tanstack Router",
                    render: <TanStackRouterDevtoolsPanel />,
                },
            ]}
        />
    )
}

ComposeViewport.Window = Window
ComposeViewport.Devtools = Devtools
