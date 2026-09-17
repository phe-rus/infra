import { XIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useIsMobile } from "@infra/ui/lib/use-media-query"
import { cn } from "@infra/ui/lib/utils"
import { Link, useNavigate } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

type NavDrawerItem = {
    to: string
    label: string
}

type NavDrawerProps = {
    open: boolean
    onClose: () => void
    items: NavDrawerItem[]
}

export function NavDrawer({
    open,
    onClose,
    items,
}: NavDrawerProps) {
    const isMobile = useIsMobile()
    const navigation = useNavigate()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const go = (to: string) => {
        onClose()
        navigation({ to })
    }

    if (!mounted) {
        return null
    }

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "fixed inset-0 z-55 bg-background/15",
                            "backdrop-blur-xs cursor-pointer"
                        )}
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 500,
                        }}
                        className={cn(
                            "fixed top-0 z-55 bg-background border-l border-border/25",
                            "shadow hover:shadow-md",
                            isMobile
                                ? "right-0 w-screen h-dvh"
                                : "right-0 w-96 h-screen"
                        )}
                    >
                        <div className="relative flex flex-col h-full">
                            <section className="relative flex flex-col gap-5">
                                <div className="flex items-center p-5">
                                    <HugeiconsIcon
                                        icon={XIcon}
                                        onClick={onClose}
                                        className={cn(
                                            "text-destructive ml-auto size-6",
                                            "cursor-pointer hover:rotate-45",
                                            "transition-all duration-300 ease-in-out"
                                        )}
                                    />
                                </div>

                                <motion.div
                                    initial="initial"
                                    animate="animate"
                                    exit="initial"
                                    variants={{
                                        animate: {
                                            transition: {
                                                staggerChildren: 0.1,
                                            },
                                        },
                                    }}
                                    className="absolute flex flex-col gap-px p-5"
                                >
                                    {items.map(
                                        ({ to, label }) => (
                                            <motion.div
                                                key={to}
                                                variants={{
                                                    initial: {
                                                        opacity: 0,
                                                        x:
                                                            -10,
                                                    },
                                                    animate: {
                                                        opacity: 1,
                                                        x: 0,
                                                    },
                                                }}
                                                className="flex items-center"
                                            >
                                                <Link
                                                    to={to}
                                                    className={cn(
                                                        "flex items-center gap-2 justify-start",
                                                        "text-2xl font-semibold group"
                                                    )}
                                                    activeProps={{
                                                        className:
                                                            "text-primary",
                                                    }}
                                                    activeOptions={{
                                                        exact:
                                                            to ===
                                                            "/",
                                                    }}
                                                    onClick={() =>
                                                        go(to)
                                                    }
                                                >
                                                    {label}
                                                </Link>
                                            </motion.div>
                                        )
                                    )}
                                </motion.div>
                            </section>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}
