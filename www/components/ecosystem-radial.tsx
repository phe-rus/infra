import { InitiativeDetail } from "@/components/initiative-detail"
import {
    domains,
    initiatives,
    type Domain,
    type Initiative,
} from "@/lib/ecosystem"
import { getDictionary } from "@/lib/i18n"
import { EASE } from "@/lib/motion"
import { cn } from "@infra/ui/lib/utils"
import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "motion/react"
import { useEffect, useMemo, useState } from "react"

const VIEW = 640
const CENTER = VIEW / 2
const HUB_RADIUS = 52

/** Innermost to outermost ring: how close a layer sits to the core organization. */
const RING_ORDER = [
    "identity",
    "science",
    "knowledge",
    "practical",
    "personal",
]
const RADII = [90, 138, 186, 234, 282]

function polar(radius: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return {
        x: CENTER + radius * Math.cos(rad),
        y: CENTER + radius * Math.sin(rad),
    }
}

function pct(value: number) {
    return `${(value / VIEW) * 100}%`
}

type Node = { item: Initiative; x: number; y: number }
type Ring = {
    domain: Domain
    ringIndex: number
    radius: number
    nodes: Node[]
    /** Angle of the widest gap between this ring's own nodes, kept clear for the label. */
    labelAngle: number
}

function useRings(): Ring[] {
    return useMemo(() => {
        return RING_ORDER.map((slug, ringIndex) => {
            const domain = domains.find(
                (d) => d.slug === slug
            )
            const items = initiatives.filter(
                (item) => item.domain === slug
            )
            const offset = ringIndex * 47
            const step = 360 / items.length
            const nodes: Node[] = items.map((item, i) => {
                const angle = offset + step * i
                const { x, y } = polar(
                    RADII[ringIndex],
                    angle
                )
                return { item, x, y }
            })
            // The gap right before the first node is equidistant from it
            // and from the last node, so it's always clear of this ring's
            // own dots regardless of item count.
            const labelAngle = offset - step / 2
            return {
                domain: domain as Domain,
                ringIndex,
                radius: RADII[ringIndex],
                nodes,
                labelAngle,
            }
        }).filter((ring) => ring.domain)
    }, [])
}

export function EcosystemRadial({
    className,
}: {
    className?: string
}) {
    const t = getDictionary()
    const reduced = useReducedMotion()
    const rings = useRings()
    const [selected, setSelected] = useState<string | null>(
        null
    )

    useEffect(() => {
        if (!selected) return
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setSelected(null)
        }
        window.addEventListener("keydown", onKey)
        return () =>
            window.removeEventListener("keydown", onKey)
    }, [selected])

    const activeNode = useMemo(() => {
        for (const ring of rings) {
            const node = ring.nodes.find(
                (n) => n.item.slug === selected
            )
            if (node)
                return {
                    ...node,
                    domain: ring.domain,
                    ringIndex: ring.ringIndex,
                }
        }
        return null
    }, [rings, selected])

    const ringVariants = {
        hidden: { opacity: 0, scale: reduced ? 1 : 0.86 },
        visible: (i: number) => ({
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: EASE,
                delay: reduced ? 0 : i * 0.09,
            },
        }),
    }

    const nodeVariants = {
        hidden: { opacity: 0, scale: reduced ? 1 : 0.4 },
        visible: (i: number) => ({
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.45,
                ease: EASE,
                delay: reduced ? 0 : 0.5 + i * 0.045,
            },
        }),
    }

    let nodeCounter = 0

    return (
        <div className={cn("w-full", className)}>
            <div className="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-[480px_minmax(2rem,1fr)_320px] md:gap-0">
                {/* Desktop / tablet: the radial system itself. */}
                <div className="relative mx-auto hidden aspect-square w-full min-w-0 md:block">
                    <svg
                        viewBox={`0 0 ${VIEW} ${VIEW}`}
                        className="absolute inset-0 h-full w-full overflow-visible"
                        aria-hidden
                    >
                        {rings.map((ring) => {
                            const filled =
                                activeNode !== null &&
                                ring.ringIndex <=
                                    activeNode.ringIndex
                            return (
                                <motion.circle
                                    key={ring.domain.slug}
                                    cx={CENTER}
                                    cy={CENTER}
                                    r={ring.radius}
                                    fill={
                                        filled
                                            ? "currentColor"
                                            : "none"
                                    }
                                    className={cn(
                                        "text-border transition-[fill-opacity] duration-500",
                                        filled &&
                                            "text-muted-foreground"
                                    )}
                                    fillOpacity={
                                        filled
                                            ? 0.16 -
                                              ring.ringIndex *
                                                  0.02
                                            : 0
                                    }
                                    stroke="currentColor"
                                    strokeWidth={1}
                                    strokeDasharray={
                                        filled
                                            ? undefined
                                            : "2 6"
                                    }
                                    custom={ring.ringIndex}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={ringVariants}
                                />
                            )
                        })}
                        <motion.circle
                            cx={CENTER}
                            cy={CENTER}
                            r={HUB_RADIUS}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1}
                            className="text-foreground/40"
                            custom={0}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={ringVariants}
                        />
                    </svg>

                    {/* Ring labels, sat in the widest gap between that ring's own nodes. */}
                    {rings.map((ring) => {
                        const { x, y } = polar(
                            ring.radius,
                            ring.labelAngle
                        )
                        return (
                            <span
                                key={ring.domain.slug}
                                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center text-[10px] tracking-wide text-muted-foreground/70 uppercase"
                                style={{
                                    left: pct(x),
                                    top: pct(y),
                                }}
                            >
                                {ring.domain.label}
                            </span>
                        )
                    })}

                    <button
                        type="button"
                        onClick={() => setSelected(null)}
                        aria-label="Pherus"
                        className="absolute flex flex-col items-center justify-center gap-1 rounded-full text-center transition-opacity"
                        style={{
                            left: pct(CENTER),
                            top: pct(CENTER),
                            width: pct(HUB_RADIUS * 2 - 20),
                            height: pct(HUB_RADIUS * 2 - 20),
                            transform:
                                "translate(-50%, -50%)",
                        }}
                    >
                        <span className="size-2 rounded-full bg-foreground" />
                        <span className="text-sm font-medium tracking-tight">
                            Pherus
                        </span>
                    </button>

                    {rings.map((ring) =>
                        ring.nodes.map((node) => {
                            const i = nodeCounter++
                            const isSelected =
                                selected === node.item.slug
                            const dimmed =
                                selected !== null &&
                                !isSelected
                            return (
                                <motion.button
                                    key={node.item.slug}
                                    type="button"
                                    custom={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={nodeVariants}
                                    onClick={() =>
                                        setSelected(
                                            (current) =>
                                                current ===
                                                node.item.slug
                                                    ? null
                                                    : node
                                                          .item
                                                          .slug
                                        )
                                    }
                                    aria-pressed={isSelected}
                                    className={cn(
                                        "group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center transition-opacity duration-300",
                                        dimmed && "opacity-35"
                                    )}
                                    style={{
                                        left: pct(node.x),
                                        top: pct(node.y),
                                    }}
                                >
                                    <span
                                        className={cn(
                                            "size-2 rounded-full bg-muted-foreground transition-all duration-300 group-hover:bg-foreground",
                                            isSelected &&
                                                "size-2.5 bg-foreground ring-4 ring-foreground/10"
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            "max-w-24 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground",
                                            isSelected &&
                                                "text-foreground"
                                        )}
                                    >
                                        {node.item.name}
                                    </span>
                                </motion.button>
                            )
                        })
                    )}
                </div>

                {/* Leader line + card, like a diagram pointing at its own explanation. */}
                <div className="hidden h-px w-full bg-border md:block" />
                <div className="w-full min-w-0">
                    <div className="min-h-40 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                        <AnimatePresence mode="wait">
                            {activeNode ? (
                                <motion.div
                                    key={activeNode.item.slug}
                                    initial={{
                                        opacity: 0,
                                        y: reduced ? 0 : 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: EASE,
                                    }}
                                >
                                    <InitiativeDetail
                                        item={activeNode.item}
                                        domain={
                                            activeNode.domain
                                        }
                                    />
                                </motion.div>
                            ) : (
                                <motion.p
                                    key="hint"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-sm text-muted-foreground"
                                >
                                    {t.ecosystem.hint}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile: same relationships, a scrollable stack instead of a shrunk circle. */}
            <div className="mt-6 flex flex-col gap-6 md:hidden">
                {rings.map((ring) => (
                    <div
                        key={ring.domain.slug}
                        className="flex flex-col gap-2"
                    >
                        <span className="text-xs tracking-wide text-muted-foreground uppercase">
                            {ring.domain.label}
                        </span>
                        <div className="flex flex-col divide-y divide-border/40 border-y border-border/40">
                            {ring.nodes.map((node) => {
                                const isSelected =
                                    selected ===
                                    node.item.slug
                                return (
                                    <button
                                        key={node.item.slug}
                                        type="button"
                                        onClick={() =>
                                            setSelected(
                                                (current) =>
                                                    current ===
                                                    node.item
                                                        .slug
                                                        ? null
                                                        : node
                                                              .item
                                                              .slug
                                            )
                                        }
                                        aria-pressed={
                                            isSelected
                                        }
                                        className="flex items-center gap-2 py-3 text-left"
                                    >
                                        <span
                                            className={cn(
                                                "size-1.5 shrink-0 rounded-full bg-muted-foreground",
                                                isSelected &&
                                                    "bg-foreground"
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                "text-sm font-medium text-muted-foreground",
                                                isSelected &&
                                                    "text-foreground"
                                            )}
                                        >
                                            {node.item.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
                {activeNode && (
                    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                        <InitiativeDetail
                            item={activeNode.item}
                            domain={activeNode.domain}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
