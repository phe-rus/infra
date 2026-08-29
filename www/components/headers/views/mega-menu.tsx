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
            className="absolute inset-x-0 top-full border-b border-border/35 bg-popover shadow-lg backdrop-blur"
        >
            <div className="flex flex-wrap gap-8 px-5 py-8">
                {sections.map((section) => (
                    <div
                        key={section.label}
                        className="flex flex-col gap-3"
                    >
                        <h2 className="text-xs font-medium text-muted-foreground">
                            {section.label}
                        </h2>
                        <div className="flex flex-col gap-0.5">
                            {section.items.map((leaf) => (
                                <Link
                                    key={leaf.to}
                                    to={leaf.to}
                                    className={cn(
                                        "flex flex-col gap-0.5 rounded-none px-2 py-1.5",
                                        "hover:bg-muted transition-colors"
                                    )}
                                    activeProps={{
                                        className: "bg-muted",
                                    }}
                                >
                                    <span className="text-sm font-medium text-foreground">
                                        {leaf.label}
                                    </span>
                                    <span className="max-w-xs text-xs text-muted-foreground">
                                        {leaf.description}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
