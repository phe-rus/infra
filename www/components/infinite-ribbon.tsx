import { BrowserFrame } from "@/components/browser-frame"
import { cn } from "@infra/ui/lib/utils"

type FrameItem = {
    type: "frame"
    key: string
    url: string
    mark: string
}
type TextItem = { type: "text"; key: string; label: string }
export type RibbonItem = FrameItem | TextItem

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
            {items.map((item, idx) => {
                if (item.type === "frame") {
                    const wave =
                        idx % 4 === 1
                            ? -10
                            : idx % 4 === 3
                              ? 10
                              : 0
                    return (
                        <div
                            key={item.key}
                            className="aspect-video w-56 shrink-0 md:w-72"
                            style={{
                                transform: `translateY(${wave}px)`,
                            }}
                        >
                            <BrowserFrame
                                url={item.url}
                                mark={item.mark}
                            />
                        </div>
                    )
                }
                return (
                    <span
                        key={item.key}
                        className="shrink-0 text-lg tracking-tight whitespace-nowrap text-muted-foreground"
                    >
                        {item.label}
                    </span>
                )
            })}
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
