import { Photo } from "@/components/photo"
import { getDictionary } from "@/lib/i18n"
import { timeline } from "@/lib/timeline"
import { EASE } from "@/lib/motion"
import { cn } from "@infra/ui/lib/utils"
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"
import { useRef } from "react"

const CARD_WIDTH = 300

function TimelineCard({
    entry,
}: {
    entry: (typeof timeline)[number]
}) {
    const large = entry.size !== "sm"
    return (
        <div
            className="flex flex-col gap-3"
            style={{
                width: large ? CARD_WIDTH : CARD_WIDTH * 0.7,
            }}
        >
            {entry.photo && large && (
                <div className="aspect-[4/3] w-full">
                    <Photo
                        seed={entry.photo}
                        width={600}
                        height={450}
                    />
                </div>
            )}
            <div className="flex flex-col gap-1">
                <span className="text-xs tracking-[0.15em] text-muted-foreground uppercase">
                    {entry.label}
                </span>
                <h3
                    className={cn(
                        "font-medium tracking-tight",
                        large ? "text-lg" : "text-sm"
                    )}
                >
                    {entry.title}
                </h3>
                {large && (
                    <p className="text-sm text-muted-foreground">
                        {entry.body}
                    </p>
                )}
            </div>
        </div>
    )
}

export function Timeline() {
    const t = getDictionary()
    const reduced = useReducedMotion()
    const trackRef = useRef<HTMLDivElement>(null)

    const scrollBy = (dir: 1 | -1) => {
        trackRef.current?.scrollBy({
            left: dir * (CARD_WIDTH + 64),
            behavior: "smooth",
        })
    }

    return (
        <div className="relative w-full">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-2 md:px-6">
                <button
                    type="button"
                    onClick={() => scrollBy(-1)}
                    aria-label={t.common.earlier}
                    className="pointer-events-auto flex size-9 items-center justify-center rounded-full border border-border/50 bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
                >
                    <HugeiconsIcon
                        icon={ArrowLeft01Icon}
                        className="size-4"
                    />
                </button>
                <button
                    type="button"
                    onClick={() => scrollBy(1)}
                    aria-label={t.common.later}
                    className="pointer-events-auto flex size-9 items-center justify-center rounded-full border border-border/50 bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
                >
                    <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="size-4"
                    />
                </button>
            </div>

            <div
                ref={trackRef}
                onWheel={(event) => {
                    if (
                        Math.abs(event.deltaY) <=
                        Math.abs(event.deltaX)
                    )
                        return
                    event.currentTarget.scrollLeft +=
                        event.deltaY
                    event.preventDefault()
                }}
                className={cn(
                    "no-scrollbar w-full overflow-x-auto",
                    "[mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]"
                )}
            >
                <div className="relative flex h-96 w-max items-stretch gap-16 px-[12vw]">
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-border"
                    />
                    {timeline.map((entry, idx) => {
                        const above = idx % 2 === 0
                        return (
                            <motion.div
                                key={entry.id}
                                initial={{
                                    opacity: 0,
                                    x: reduced
                                        ? 0
                                        : above
                                          ? -24
                                          : 24,
                                }}
                                whileInView={{
                                    opacity: 1,
                                    x: 0,
                                }}
                                viewport={{
                                    once: true,
                                    amount: 0.6,
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: EASE,
                                }}
                                className="flex h-full shrink-0 flex-col"
                            >
                                <div className="flex flex-1 flex-col justify-end pb-4">
                                    {above && (
                                        <TimelineCard
                                            entry={entry}
                                        />
                                    )}
                                </div>
                                <span
                                    aria-hidden
                                    className={cn(
                                        "size-2.5 shrink-0 self-center rounded-full",
                                        idx === 0
                                            ? "bg-foreground"
                                            : "bg-muted-foreground"
                                    )}
                                />
                                <div className="flex flex-1 flex-col justify-start pt-4">
                                    {!above && (
                                        <TimelineCard
                                            entry={entry}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
