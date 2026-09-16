import type { NavItem } from "@components/toolbars/config"
import { XIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useIsMobile } from "@infra/ui/lib/use-media-query"
import { cn } from "@infra/ui/lib/utils"
import { Link, useNavigate } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

type NavDrawerProps = {
    open: boolean
    onClose: () => void
    items: NavItem[]
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
                            "fixed inset-0 z-50 bg-background/15",
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
                            "fixed top-0 z-50 bg-background border-l border-border/25",
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
                                        ({
                                            to,
                                            Icon,
                                            label,
                                            items: subItems,
                                        }) => (
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
                                                className={cn(
                                                    "flex items-center",
                                                    subItems &&
                                                    "flex-col items-start"
                                                )}
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
                                                    onClick={() =>
                                                        go(to)
                                                    }
                                                >
                                                    <HugeiconsIcon
                                                        icon={
                                                            Icon
                                                        }
                                                        className="size-5"
                                                    />
                                                    {label}
                                                </Link>
                                                {subItems?.map(
                                                    (sub) => (
                                                        <Link
                                                            key={
                                                                sub.to
                                                            }
                                                            to={
                                                                sub.to
                                                            }
                                                            className={cn(
                                                                "flex items-center justify-start",
                                                                "text-2xl font-semibold group ml-6 mb-2"
                                                            )}
                                                            activeProps={{
                                                                className:
                                                                    "text-primary",
                                                            }}
                                                            onClick={() =>
                                                                go(
                                                                    sub.to
                                                                )
                                                            }
                                                        >
                                                            {
                                                                sub.label
                                                            }
                                                        </Link>
                                                    )
                                                )}
                                            </motion.div>
                                        )
                                    )}
                                </motion.div>
                            </section>

                            <div className="absolute flex flex-col gap-px bottom-5 p-5">
                                <p className="text-sm">
                                    Copyright (c) 2026-2027 Pherus Inc.
                                    All rights reserved.
                                </p>
                                <p className="text-sm">
                                    MIT License
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}
