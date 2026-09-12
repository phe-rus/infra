import { BrowserFrame } from "@/components/browser-frame"
import { initiatives, STATUS_LABEL } from "@/lib/ecosystem"
import { getDictionary } from "@/lib/i18n"
import { cn } from "@infra/ui/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"

const EASE = [0.16, 1, 0.3, 1] as const

export function EcosystemShowcase() {
    const t = getDictionary()
    const [selected, setSelected] = useState<string | null>(
        null
    )
    const active = initiatives.find(
        (item) => item.slug === selected
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

    return (
        <div className="container w-full">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {initiatives.map((item, idx) => (
                    <motion.button
                        key={item.slug}
                        type="button"
                        layoutId={`showcase-${item.slug}`}
                        onClick={() => setSelected(item.slug)}
                        className={cn(
                            "group relative aspect-video overflow-hidden rounded-md text-left",
                            idx === 0 && "col-span-2"
                        )}
                        style={{
                            rotate:
                                idx % 3 === 1
                                    ? "-0.6deg"
                                    : idx % 3 === 2
                                        ? "0.6deg"
                                        : "0deg",
                        }}
                        whileHover={{ scale: 1.015 }}
                        transition={{
                            duration: 0.4,
                            ease: EASE,
                        }}
                    >
                        <BrowserFrame
                            url={`pherus.org/showcase/${item.slug}`}
                            mark={item.name}
                            className="transition-shadow duration-300 group-hover:shadow-md"
                        />
                    </motion.button>
                ))}
            </div>

            <AnimatePresence>
                {active && (
                    <motion.div
                        className="fixed inset-0 z-60 flex items-center justify-center bg-background/90 p-6 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            layoutId={`showcase-${active.slug}`}
                            className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-md bg-background shadow-xl md:flex-row"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="aspect-video w-full md:h-auto md:w-1/2">
                                <BrowserFrame
                                    url={`pherus.org/showcase/${active.slug}`}
                                    mark={active.name}
                                    className="rounded-none border-0"
                                />
                            </div>
                            <div className="flex flex-1 flex-col gap-3 p-6">
                                <span className="text-xs tracking-wide text-muted-foreground uppercase">
                                    {active.kind}
                                    {active.status
                                        ? ` · ${STATUS_LABEL[active.status]}`
                                        : ""}
                                </span>
                                <h3 className="text-2xl font-medium tracking-tight">
                                    {active.name}
                                </h3>
                                <p className="text-muted-foreground">
                                    {active.summary}
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelected(null)
                                    }
                                    className="mt-auto w-fit text-sm text-muted-foreground hover:text-foreground"
                                >
                                    {t.showcase.close}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
