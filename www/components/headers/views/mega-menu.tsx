import { cn } from "@infra/ui/lib/utils"
import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import type { NavSection } from "../config"

export function MegaMenu({
    sections,
}: {
    sections: NavSection[]
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
                "absolute inset-x-0 top-full border-b border-border/35",
                'bg-background backdrop-blur-2xl! shadow-lg z-55!'
            )}
        >
            <div className="container columns-3 gap-8 px-5 py-20">
                {sections.map((section) => (
                    <div
                        key={section.label}
                        className={cn(
                            "break-inside-avoid flex flex-col gap-3",
                            'mb-5'
                        )}
                    >
                        <h2 className="opacity-70">
                            {section.label}
                        </h2>
                        <div className="flex flex-col gap-1">
                            {section.items.map((leaf) => (
                                <Link
                                    key={leaf.to}
                                    to={leaf.to}
                                    className={cn(
                                        "flex items-center gap-1 overflow-hidden",
                                        "group transition-colors"
                                    )}
                                >
                                    <span className={cn('h-10 w-px bg-olive-500', 'hidden group-hover:block group-focus:block')} />
                                    <div className='flex flex-col gap-0.5'>
                                        <span className="text-sm font-medium text-foreground">
                                            {leaf.label}
                                        </span>
                                        <span className="max-w-xs text-xs text-muted-foreground">
                                            {leaf.description}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
