import { cn } from "@infra/ui/lib/utils"

export type RibbonItem = { key: string; label: string }

export function InfiniteRibbon({
    items,
    duration = 44,
    reverse = false,
}: {
    items: RibbonItem[]
    duration?: number
    reverse?: boolean
}) {
    const track = (hidden: boolean) => (
        <div
            className="flex items-center gap-8 pr-8"
            aria-hidden={hidden || undefined}
        >
            {items.map((item) => (
                <span
                    key={item.key}
                    className="shrink-0 text-lg tracking-tight whitespace-nowrap text-muted-foreground"
                >
                    {item.label}
                </span>
            ))}
        </div>
    )

    return (
        <div className="ribbon-mask relative w-full overflow-hidden select-none">
            <div
                className={cn(
                    "flex w-max",
                    reverse
                        ? "animate-ribbon-reverse"
                        : "animate-ribbon"
                )}
                style={{ animationDuration: `${duration}s` }}
            >
                {track(false)}
                {track(true)}
            </div>
        </div>
    )
}
