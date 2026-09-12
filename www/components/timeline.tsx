import { BrowserFrame } from "@/components/browser-frame"
import { timeline } from "@/lib/timeline"
import { cn } from "@infra/ui/lib/utils"
import { motion, useReducedMotion } from "motion/react"

const EASE = [0.16, 1, 0.3, 1] as const

function TimelineCard({
    entry,
}: {
    entry: (typeof timeline)[number]
}) {
    return (
        <div className="flex flex-col gap-2">
            <div className="aspect-video w-full">
                <BrowserFrame
                    url={`pherus.org/${entry.id}`}
                    mark={entry.label}
                />
            </div>
            <span className="text-xs tracking-[0.15em] text-muted-foreground uppercase">
                {entry.label}
            </span>
            <h3 className="font-medium">{entry.title}</h3>
            <p className="text-sm text-muted-foreground">
                {entry.body}
            </p>
        </div>
    )
}

export function Timeline() {
    const reduced = useReducedMotion()

    return (
        <div className="w-full overflow-x-auto">
            <div className="relative h-96 w-max px-6 md:px-16">
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-border"
                />
                <div className="relative flex h-full items-stretch gap-16">
                    {timeline.map((entry, idx) => {
                        const above = idx % 2 === 0
                        return (
                            <motion.div
                                key={entry.id}
                                initial={{
                                    opacity: 0,
                                    y: reduced
                                        ? 0
                                        : above
                                          ? 16
                                          : -16,
                                }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                viewport={{
                                    once: true,
                                    amount: 0.6,
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: EASE,
                                }}
                                className="flex h-full w-64 shrink-0 flex-col"
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
