import { cn } from "@infra/ui/lib/utils"
import type { ReactNode } from "react"

export function BrowserFrame({
    url,
    mark,
    className,
}: {
    url: string
    mark?: ReactNode
    className?: string
}) {
    return (
        <div
            className={cn(
                "flex h-full w-full flex-col overflow-hidden rounded-md border border-border/50 bg-muted/20",
                className
            )}
        >
            <div className="flex shrink-0 items-center gap-3 border-b border-border/40 bg-muted/40 px-3 py-2">
                <div className="flex gap-1.5">
                    <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                </div>
                <span className="flex-1 truncate rounded-sm bg-background/70 px-2 py-0.5 text-center text-[10px] text-muted-foreground">
                    {url}
                </span>
            </div>
            <div
                className="relative flex flex-1 items-center justify-center text-border/50"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, currentColor 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                }}
            >
                {mark && (
                    <span className="relative rounded-sm bg-background/80 px-3 py-1 text-sm font-medium tracking-tight text-foreground">
                        {mark}
                    </span>
                )}
            </div>
        </div>
    )
}
