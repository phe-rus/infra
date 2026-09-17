import { getNavItems } from "@components/toolbars/config"
import { NavDrawer } from "@components/toolbars/views/nav-drawer"
import { MoreHorizontal } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { buttonVariants } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { useNavigate } from "@tanstack/react-router"
import { motion } from "motion/react"
import { useState } from "react"

export function Toolbar() {
    const [open, setOpen] = useState(false)
    const navigation = useNavigate()
    const items = getNavItems()

    return (
        <>
            <motion.header
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "sticky flex top-0 bg-background/20 backdrop-blur-sm border-b",
                    "border-border/35 select-none z-10"
                )}
            >
                <section className="px-5 flex items-center justify-between w-full h-11">
                    <div className="flex items-center gap-5">
                        <div
                            onClick={() =>
                                navigation({ to: "/" })
                            }
                            className="flex items-center gap-1 cursor-pointer"
                        >
                            <picture>
                                <img
                                    src="/favicon.svg"
                                    alt="Pherus"
                                    className="size-4 dark:hidden"
                                    data-not-typeset
                                />
                                <img
                                    src="/favicon_light.png"
                                    alt="Pherus"
                                    className="size-4 hidden dark:block"
                                    data-not-typeset
                                />
                            </picture>
                            <h1 className="text-lg font-bold">
                                Pherus
                            </h1>
                        </div>
                    </div>

                    <nav className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() =>
                                setOpen((prev) => !prev)
                            }
                            onTouchStart={(e) =>
                                e.preventDefault()
                            }
                            onPointerDown={(e) =>
                                e.preventDefault()
                            }
                            title="More"
                            aria-expanded={open}
                            aria-label="Toggle sidebar"
                            className={cn(
                                buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                })
                            )}
                        >
                            <HugeiconsIcon
                                icon={MoreHorizontal}
                            />
                        </button>
                    </nav>
                </section>
            </motion.header>

            <NavDrawer
                open={open}
                onClose={() => setOpen(false)}
                items={items}
            />
        </>
    )
}
