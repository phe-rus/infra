import { InitiativeDetail } from "@/components/initiative-detail"
import { Photo } from "@/components/photo"
import {
    domains,
    initiatives,
    type Initiative,
} from "@/lib/ecosystem"
import { cn } from "@infra/ui/lib/utils"
import {
    AnimatePresence,
    animate,
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from "motion/react"
import { useEffect, useRef, useState } from "react"

const CARD_WIDTH = 380
const GAP = 32
const STEP = CARD_WIDTH + GAP
/**
 * A flex row centered via `justify-center` centers itself around its own
 * middle item, not index 0 — every position (offset math, drag bounds,
 * goTo, active tracking) is expressed relative to this middle index so
 * the "active" state and what's actually centered on screen agree.
 */
const CENTER_INDEX = (initiatives.length - 1) / 2

function domainFor(item: Initiative) {
    return domains.find((d) => d.slug === item.domain)
}

function Card({
    item,
    index,
    springX,
    isActive,
    onSelect,
}: {
    item: Initiative
    index: number
    springX: ReturnType<typeof useSpring>
    isActive: boolean
    onSelect: (index: number) => void
}) {
    const offset = useTransform(
        springX,
        (v) => index - CENTER_INDEX + v / STEP
    )
    const rotateY = useTransform(
        offset,
        [-2.5, -1, 0, 1, 2.5],
        [42, 24, 0, -24, -42]
    )
    const z = useTransform(
        offset,
        [-2.5, -1, 0, 1, 2.5],
        [-320, -160, 40, -160, -320]
    )
    const scale = useTransform(
        offset,
        [-2.5, -1, 0, 1, 2.5],
        [0.76, 0.9, 1.02, 0.9, 0.76]
    )
    const opacity = useTransform(
        offset,
        [-2.8, -1.2, 0, 1.2, 2.8],
        [0.2, 0.65, 1, 0.65, 0.2]
    )

    return (
        <motion.button
            type="button"
            onClick={() => onSelect(index)}
            style={{
                rotateY,
                z,
                scale,
                opacity,
                transformStyle: "preserve-3d",
            }}
            className={cn(
                "relative shrink-0 w-[min(380px,72vw)] aspect-[4/3] overflow-hidden rounded-2xl text-left",
                "shadow-[0_30px_70px_-20px_rgba(0,0,0,0.35)]",
                isActive && "ring-1 ring-foreground/15"
            )}
        >
            <Photo
                seed={`showcase-${item.slug}`}
                width={900}
                height={675}
                frame={false}
            />
            <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
            />
            <span className="absolute bottom-4 left-4 text-xl font-medium tracking-tight text-white md:text-2xl">
                {item.name}
            </span>
        </motion.button>
    )
}

export function ShowcaseGallery() {
    const reduced = useReducedMotion()
    const total = initiatives.length
    const containerRef = useRef<HTMLDivElement>(null)
    const x = useMotionValue(CENTER_INDEX * STEP)
    const springX = useSpring(x, {
        stiffness: 140,
        damping: 26,
        mass: 0.85,
    })
    const [active, setActive] = useState(0)
    const [detailOpen, setDetailOpen] = useState(false)

    useEffect(() => {
        return springX.on("change", (value) => {
            const index = Math.round(
                CENTER_INDEX - value / STEP
            )
            setActive(Math.max(0, Math.min(total - 1, index)))
        })
    }, [springX, total])

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const onWheel = (e: WheelEvent) => {
            e.preventDefault()
            const next = x.get() - e.deltaY * 0.85
            const min = (CENTER_INDEX - (total - 1)) * STEP
            const max = CENTER_INDEX * STEP
            x.set(Math.max(min, Math.min(max, next)))
        }
        el.addEventListener("wheel", onWheel, {
            passive: false,
        })
        return () => el.removeEventListener("wheel", onWheel)
    }, [x, total])

    const goTo = (index: number) => {
        const clamped = Math.max(
            0,
            Math.min(total - 1, index)
        )
        animate(x, (CENTER_INDEX - clamped) * STEP, {
            type: "spring",
            stiffness: 200,
            damping: 28,
        })
    }

    const handleSelect = (index: number) => {
        if (index === active) {
            setDetailOpen((open) => !open)
        } else {
            setDetailOpen(false)
            goTo(index)
        }
    }

    const handleDragEnd = (
        _: unknown,
        info: { velocity: { x: number } }
    ) => {
        const projected = x.get() + info.velocity.x * 0.22
        const nearest = Math.round(
            CENTER_INDEX - projected / STEP
        )
        goTo(nearest)
    }

    const activeItem = initiatives[active]

    return (
        <div className="flex flex-col gap-8">
            {/* Desktop / tablet: one continuous coverflow environment. */}
            <div
                ref={containerRef}
                className="relative hidden h-[70vh] max-h-[600px] w-full overflow-hidden md:block"
            >
                <div className="absolute inset-0 flex items-center justify-center perspective-[1600px]">
                    <motion.div
                        drag="x"
                        dragConstraints={{
                            left:
                                (CENTER_INDEX - (total - 1)) *
                                STEP,
                            right: CENTER_INDEX * STEP,
                        }}
                        dragElastic={0.08}
                        onDragEnd={handleDragEnd}
                        style={{
                            x: springX,
                            gap: GAP,
                            transformStyle: "preserve-3d",
                        }}
                        className="flex cursor-grab items-center active:cursor-grabbing"
                    >
                        {initiatives.map((item, index) => (
                            <Card
                                key={item.slug}
                                item={item}
                                index={index}
                                springX={springX}
                                isActive={index === active}
                                onSelect={handleSelect}
                            />
                        ))}
                    </motion.div>
                </div>
                <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-sm tabular-nums text-muted-foreground">
                    {String(active + 1).padStart(2, "0")}/
                    {String(total).padStart(2, "0")}
                </p>
            </div>

            {/* Mobile: the same objects, stacked and tapped rather than dragged in 3D. */}
            <div className="flex flex-col gap-4 md:hidden">
                {initiatives.map((item, index) => (
                    <button
                        key={item.slug}
                        type="button"
                        onClick={() => handleSelect(index)}
                        className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl text-left"
                    >
                        <Photo
                            seed={`showcase-${item.slug}`}
                            width={800}
                            height={600}
                            frame={false}
                        />
                        <span
                            aria-hidden
                            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
                        />
                        <span className="absolute bottom-4 left-4 text-lg font-medium tracking-tight text-white">
                            {item.name}
                        </span>
                    </button>
                ))}
            </div>

            <AnimatePresence initial={false}>
                {detailOpen && activeItem && (
                    <motion.div
                        key={activeItem.slug}
                        initial={{
                            opacity: 0,
                            height: 0,
                        }}
                        animate={{
                            opacity: 1,
                            height: "auto",
                        }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                            duration: reduced ? 0 : 0.35,
                        }}
                        className="mx-auto w-full max-w-lg overflow-hidden"
                    >
                        <div className="rounded-2xl border border-border/50 bg-card p-6 text-center shadow-sm">
                            <InitiativeDetail
                                item={activeItem}
                                domain={domainFor(activeItem)}
                                className="items-center"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
