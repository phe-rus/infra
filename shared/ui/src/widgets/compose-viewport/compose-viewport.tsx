import type { ComponentPropsWithoutRef, PropsWithChildren } from "react"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { cn } from "../../lib/utils"

type ComposeViewportProps = PropsWithChildren<{
    className?: string
}>

type WindowProps = ComponentPropsWithoutRef<"body">

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

function Window({ className, children, ...props }: WindowProps) {
    return (
        <body
            className={cn(
                "relative min-h-dvh min-w-full border bg-background",
                "overflow-x-hidden selection:bg-olive-500/15",
                "typeset wrap-anywhere duration-200",
                "flex flex-col",
                className
            )}
            {...props}
        >
            {children}
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
