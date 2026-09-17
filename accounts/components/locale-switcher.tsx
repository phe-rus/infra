import { getNativeLanguageName } from "@/lib/intl.displayNames"
import { m } from "@/src/paraglide/messages"
import {
    getLocale,
    locales,
    setLocale,
} from "@/src/paraglide/runtime"
import { cn } from "@infra/ui/lib/utils"
import {
    AnimatePresence,
    motion,
    useDragControls,
    useMotionValue,
} from "motion/react"
import { useEffect, useRef, useState } from "react"

const POSITION_STORAGE_KEY = "accounts.localeSwitcherPosition"

type Side = "left" | "right"
type Edge = "top" | "bottom"

type Anchor = {
    side: Side
    edge: Edge
    x: number
    y: number
}

const DEFAULT_ANCHOR: Anchor = {
    side: "right",
    edge: "bottom",
    x: 20,
    y: 20,
}

function loadStoredAnchor(): Anchor | null {
    try {
        const raw = localStorage.getItem(POSITION_STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as Partial<Anchor>
        if (
            (parsed.side === "left" ||
                parsed.side === "right") &&
            (parsed.edge === "top" ||
                parsed.edge === "bottom") &&
            typeof parsed.x === "number" &&
            typeof parsed.y === "number"
        ) {
            return {
                side: parsed.side,
                edge: parsed.edge,
                x: parsed.x,
                y: parsed.y,
            }
        }
    } catch {}
    return null
}

function saveStoredAnchor(anchor: Anchor) {
    try {
        localStorage.setItem(
            POSITION_STORAGE_KEY,
            JSON.stringify(anchor)
        )
    } catch {}
}

function selectLocale(value: string) {
    // biome-ignore lint/suspicious/noExplicitAny: tanstack types are weird
    setLocale(value as any)
}

export function LocaleSwitcher() {
    const containerRef = useRef<HTMLDivElement>(null)
    const dragControls = useDragControls()
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const [open, setOpen] = useState(false)
    const [anchor, setAnchor] = useState(DEFAULT_ANCHOR)

    const langs = Array.from(locales, (value) => ({
        value: value,
        label: getNativeLanguageName(value),
    }))

    useEffect(() => {
        const stored = loadStoredAnchor()
        if (stored) setAnchor(stored)
    }, [])

    useEffect(() => {
        if (!open) return
        function handlePointerDown(e: PointerEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    e.target as Node
                )
            ) {
                setOpen(false)
            }
        }
        document.addEventListener(
            "pointerdown",
            handlePointerDown
        )
        return () =>
            document.removeEventListener(
                "pointerdown",
                handlePointerDown
            )
    }, [open])

    function commitDraggedPosition() {
        const el = containerRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const side: Side =
            rect.left + rect.width / 2 < window.innerWidth / 2
                ? "left"
                : "right"
        const edge: Edge =
            rect.top + rect.height / 2 <
            window.innerHeight / 2
                ? "top"
                : "bottom"
        const next: Anchor = {
            side,
            edge,
            x:
                side === "left"
                    ? rect.left
                    : window.innerWidth - rect.right,
            y:
                edge === "top"
                    ? rect.top
                    : window.innerHeight - rect.bottom,
        }
        setAnchor(next)
        saveStoredAnchor(next)
        x.set(0)
        y.set(0)
    }

    const growsUp = anchor.edge === "bottom"

    return (
        <motion.div
            ref={containerRef}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            style={{
                position: "fixed",
                x,
                y,
                ...(anchor.side === "left"
                    ? { left: anchor.x }
                    : { right: anchor.x }),
                ...(anchor.edge === "top"
                    ? { top: anchor.y }
                    : { bottom: anchor.y }),
            }}
            onDragEnd={commitDraggedPosition}
            onMouseLeave={() => open && setOpen(false)}
            className="z-60"
        >
            <motion.div
                layout
                transition={{
                    type: "spring",
                    damping: 28,
                    stiffness: 380,
                }}
                className={cn(
                    "overflow-hidden rounded-2xl border bg-popover shadow-lg",
                    "flex",
                    growsUp ? "flex-col-reverse" : "flex-col",
                    open ? "w-40 gap-px p-1" : "size-10"
                )}
            >
                <button
                    type="button"
                    aria-label={m["header.languages"]()}
                    aria-expanded={open}
                    onPointerDown={(e) =>
                        dragControls.start(e)
                    }
                    onClick={() => setOpen((prev) => !prev)}
                    className={cn(
                        "flex shrink-0 cursor-grab items-center justify-center",
                        "active:cursor-grabbing text-xs font-semibold",
                        open
                            ? "h-9 w-full rounded-lg hover:bg-accent"
                            : "size-10 rounded-2xl"
                    )}
                >
                    {getLocale().toUpperCase()}
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.05 }}
                            className="flex flex-col gap-px"
                        >
                            {langs.map((item) => {
                                const active =
                                    item.value === getLocale()
                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => {
                                            setOpen(false)
                                            if (!active) {
                                                selectLocale(
                                                    item.value
                                                )
                                            }
                                        }}
                                        className={cn(
                                            "rounded-sm px-2 py-1.5 text-left text-sm",
                                            "hover:bg-accent transition-colors",
                                            active &&
                                                "text-primary font-medium"
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )
}
