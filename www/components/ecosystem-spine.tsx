import {
    domains,
    initiatives,
    STATUS_LABEL,
    type Initiative,
} from "@/lib/ecosystem"
import { cn } from "@infra/ui/lib/utils"
import { motion, useReducedMotion } from "motion/react"
import { useMemo } from "react"

const EASE = [0.16, 1, 0.3, 1] as const
const NEAR_PCT = 15
const FAR_PCT = 28

function offsetFor(item: Initiative) {
    return item.kind === "initiative" ? FAR_PCT : NEAR_PCT
}

function domainLabel(slug: string) {
    return (
        domains.find((domain) => domain.slug === slug)
            ?.label ?? slug
    )
}

export function EcosystemSpine({
    detailed = false,
}: {
    detailed?: boolean
}) {
    const reduced = useReducedMotion()
    const rowHeight = detailed ? 116 : 68
    const headHeight = detailed ? 140 : 96

    const pass = initiatives.find(
        (item) => item.slug === "pass"
    )
    const branches = initiatives.filter(
        (item) => item.slug !== "pass"
    )
    const totalHeight =
        headHeight + branches.length * rowHeight + 40

    const line = useMemo(
        () => ({
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
                pathLength: 1,
                opacity: 1,
                transition: {
                    duration: reduced ? 0 : 1.4,
                    ease: EASE,
                },
            },
        }),
        [reduced]
    )

    const node = useMemo(
        () => ({
            hidden: { opacity: 0, scale: reduced ? 1 : 0.7 },
            visible: (i: number) => ({
                opacity: 1,
                scale: 1,
                transition: {
                    duration: 0.4,
                    ease: EASE,
                    delay: reduced ? 0 : 0.4 + i * 0.09,
                },
            }),
        }),
        [reduced]
    )

    if (!pass) return null

    return (
        <div
            className="relative mx-auto w-full"
            style={{ height: totalHeight }}
        >
            <svg
                className="absolute inset-0 h-full w-full"
                viewBox={`0 0 100 ${totalHeight}`}
                preserveAspectRatio="none"
                aria-hidden
            >
                <motion.line
                    x1={50}
                    y1={headHeight / 2}
                    x2={50}
                    y2={totalHeight - 20}
                    stroke="currentColor"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    className="text-border"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={line}
                />
                {branches.map((item, i) => {
                    const y =
                        headHeight +
                        i * rowHeight +
                        rowHeight / 2
                    const side = i % 2 === 0 ? 1 : -1
                    const x2 = 50 + side * offsetFor(item)
                    return (
                        <motion.line
                            key={item.slug}
                            x1={50}
                            y1={y}
                            x2={x2}
                            y2={y}
                            stroke="currentColor"
                            strokeWidth={1}
                            vectorEffect="non-scaling-stroke"
                            className="text-border"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={line}
                        />
                    )
                })}
            </svg>

            <motion.div
                initial="hidden"
                animate="visible"
                custom={0}
                variants={node}
                className="absolute top-0 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-center"
                style={{ width: "clamp(140px, 55vw, 200px)" }}
            >
                <span className="size-3 rounded-full bg-foreground" />
                <span className="font-medium">
                    {pass.name}
                </span>
                <span className="text-xs tracking-wide text-muted-foreground uppercase">
                    {pass.kind}
                    {pass.status
                        ? ` · ${STATUS_LABEL[pass.status]}`
                        : ""}
                </span>
                {detailed && (
                    <p className="mt-1 max-w-55 text-xs text-muted-foreground">
                        {pass.summary}
                    </p>
                )}
            </motion.div>

            {branches.map((item, i) => {
                const y =
                    headHeight + i * rowHeight + rowHeight / 2
                const side = i % 2 === 0 ? 1 : -1
                const xPct = 50 + side * offsetFor(item)
                return (
                    <motion.div
                        key={item.slug}
                        custom={i + 1}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={node}
                        className={cn(
                            "absolute flex flex-col gap-0.5",
                            side === 1
                                ? "items-start"
                                : "items-end"
                        )}
                        style={{
                            top: y,
                            left: `${xPct}%`,
                            transform: `translate(${side === 1
                                ? "10px"
                                : "calc(-100% - 10px)"
                                }, -50%)`,
                            maxWidth: `clamp(90px, 26vw, ${detailed ? 200 : 150}px)`,
                        }}
                    >
                        <span
                            className="flex items-center gap-1.5"
                            style={{
                                flexDirection:
                                    side === 1
                                        ? "row"
                                        : "row-reverse",
                            }}
                        >
                            <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                            <span className="text-sm font-medium">
                                {item.name}
                            </span>
                        </span>
                        {detailed ? (
                            <>
                                <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                    {domainLabel(item.domain)}
                                </span>
                                <p
                                    className={cn(
                                        "text-xs text-muted-foreground",
                                        side === 1
                                            ? "text-left"
                                            : "text-right"
                                    )}
                                >
                                    {item.summary}
                                </p>
                            </>
                        ) : (
                            <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                {item.kind}
                            </span>
                        )}
                    </motion.div>
                )
            })}
        </div>
    )
}
