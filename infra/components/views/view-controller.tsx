import type { PropsWithChildren, ReactNode } from "react"
import { cn } from "@infra/ui/lib/utils"

type ViewControllerProps = PropsWithChildren<{
    heading: ReactNode
    className?: string
}>

type HeadingProps = {
    title: ReactNode
    description?: ReactNode
    action?: ReactNode
    size?: keyof typeof titleSizes
}

const titleSizes = {
    default: "text-3xl md:text-4xl",
    compact: "text-3xl",
} as const

export function ViewController({ heading, className, children }: ViewControllerProps) {
    return (
        <article
            className={cn(
                "container mx-auto flex flex-col",
                "w-full gap-5 py-20 md:max-w-3xl",
                className
            )}
        >
            <section>{heading}</section>
            {children}
        </article>
    )
}

function Heading({ title, description, action, size = "default" }: HeadingProps) {
    return (
        <>
            <div className="flex items-center gap-2">
                <h1 className={titleSizes[size]}>{title}</h1>
                {action}
            </div>
            {description && <p className="text-muted-foreground">{description}</p>}
        </>
    )
}

ViewController.Heading = Heading
