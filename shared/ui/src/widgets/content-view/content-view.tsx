import type { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from "react"
import { cn } from "../../lib/utils"

type ContentViewProps = ComponentPropsWithoutRef<"section"> & {
    variant?: keyof typeof variants
}

type RowProps = ComponentPropsWithoutRef<"div">

type SectionProps = ComponentPropsWithoutRef<"section">

type HeaderProps = PropsWithChildren<{
    heading: string
    p?: string
    pClassName?: string
    icon?: ReactNode
    action?: ReactNode
    as?: "h1" | "h2" | "h3"
    className?: string
}>

type H1Props = ComponentPropsWithoutRef<"h1">

type H2Props = ComponentPropsWithoutRef<"h2">

type PProps = ComponentPropsWithoutRef<"p">

type SpanProps = ComponentPropsWithoutRef<"span">

type SubProps = ComponentPropsWithoutRef<"sub">

const variants = {
    elevated: cn(
        "rounded-2xl bg-card border border-border/35",
        "shadow hover:shadow-md cursor-pointer group"
    ),
} as const

export function ContentView({
    variant = "elevated",
    className,
    children,
    ...props
}: ContentViewProps) {
    return (
        <section className={cn(variants[variant], className)} {...props}>
            {children}
        </section>
    )
}

function Row({ className, children, ...props }: RowProps) {
    return (
        <div className={cn("flex items-center", className)} {...props}>
            {children}
        </div>
    )
}

function Section({ className, children, ...props }: SectionProps) {
    return (
        <section className={cn("flex flex-col gap-3", className)} {...props}>
            {children}
        </section>
    )
}

function Header({
    heading,
    p,
    pClassName,
    icon,
    action,
    as: Tag = "h3",
    className,
    children,
}: HeaderProps) {
    const title = (
        <Tag className={cn(icon && "flex items-center gap-2")}>
            {icon}
            {heading}
        </Tag>
    )

    return (
        <div className={className}>
            {action ? (
                <div className="flex items-center gap-3">
                    {title}
                    {action}
                </div>
            ) : (
                title
            )}
            {p && <p className={pClassName}>{p}</p>}
            {children}
        </div>
    )
}

function Divider() {
    return <span className="h-16 w-px bg-border" />
}

function H1({ className, children, ...props }: H1Props) {
    return (
        <h1 className={className} {...props}>
            {children}
        </h1>
    )
}

function H2({ className, children, ...props }: H2Props) {
    return (
        <h2 className={className} {...props}>
            {children}
        </h2>
    )
}

function P({ className, children, ...props }: PProps) {
    return (
        <p className={cn("leading-tight font-medium", className)} {...props}>
            {children}
        </p>
    )
}

function Span({ className, children, ...props }: SpanProps) {
    return (
        <span className={cn("text-base tracking-tighter font-light", className)} {...props}>
            {children}
        </span>
    )
}

function Sub({ className, children, ...props }: SubProps) {
    return (
        <sub className={cn("text-sm text-primary", className)} {...props}>
            {children}
        </sub>
    )
}

ContentView.Row = Row
ContentView.Section = Section
ContentView.Header = Header
ContentView.Divider = Divider
ContentView.H1 = H1
ContentView.H2 = H2
ContentView.P = P
ContentView.Span = Span
ContentView.Sub = Sub
