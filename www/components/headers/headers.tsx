import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { IconMenu3 } from "@tabler/icons-react"
import { Link, useLocation } from "@tanstack/react-router"
import { AnimatePresence } from "motion/react"
import { useMemo, useState } from "react"
import { config, isNavGroup } from "./config"
import { MegaMenu } from "./mega-menu"
import { MobileNav } from "./mobile-nav"

export const Headers = () => {
    const location = useLocation()
    const [hoveredLabel, setHoveredLabel] = useState<
        string | null
    >(null)
    const [mobileOpen, setMobileOpen] = useState(false)

    const hoveredGroup = useMemo(() => {
        const item = config.find(
            (item) => item.label === hoveredLabel
        )
        return item && isNavGroup(item) ? item : null
    }, [hoveredLabel])

    const isActive = (to: string) => {
        if (to === "/") {
            return location.pathname === "/"
        }
        return location.pathname.startsWith(to)
    }

    return (
        <header
            className={cn(
                "sticky top-0 border-b bg-background",
                "z-55 border-border/35"
            )}
            onMouseLeave={() => setHoveredLabel(null)}
        >
            <section
                className={cn(
                    "px-5 flex items-center justify-between",
                    "h-10 w-full"
                )}
            >
                <div className="flex items-center gap-5">
                    <h3 className="text-sm">Pherus</h3>
                    <nav className="hidden items-center gap-3 md:flex">
                        {config.map((item, idx) => {
                            if (isNavGroup(item)) {
                                const active =
                                    hoveredLabel ===
                                    item.label
                                return (
                                    <div
                                        key={idx}
                                        onMouseEnter={() =>
                                            setHoveredLabel(
                                                item.label
                                            )
                                        }
                                        className="relative"
                                    >
                                        <article
                                            className={cn(
                                                "group flex flex-col items-center gap-1",
                                                "select-none transition-colors",
                                                "cursor-pointer"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "text-xs transition-colors",
                                                    active &&
                                                        "text-primary"
                                                )}
                                            >
                                                {item.label}
                                            </span>
                                            <span
                                                className={cn(
                                                    "absolute -bottom-2.75 h-px w-full scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100",
                                                    active &&
                                                        "scale-x-100"
                                                )}
                                            />
                                        </article>
                                    </div>
                                )
                            }

                            const active = isActive(item.to)

                            return (
                                <div
                                    key={idx}
                                    className="relative"
                                >
                                    <article
                                        className={cn(
                                            "group flex flex-col items-center gap-1",
                                            "select-none transition-colors",
                                            "cursor-pointer"
                                        )}
                                    >
                                        <Link
                                            to={item.to}
                                            onMouseEnter={() =>
                                                setHoveredLabel(
                                                    null
                                                )
                                            }
                                            className={cn(
                                                "text-xs transition-colors",
                                                active &&
                                                    "text-primary"
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                        <span
                                            className={cn(
                                                "absolute -bottom-2.75 h-px w-full scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100",
                                                active &&
                                                    "scale-x-100"
                                            )}
                                        />
                                    </article>
                                </div>
                            )
                        })}
                    </nav>
                </div>

                <nav className="flex items-center gap-3">
                    <Button variant="destructive" size="xs">
                        Logout
                    </Button>
                    <Button
                        size="icon-xs"
                        variant="secondary"
                        className="flex md:hidden"
                        onClick={() =>
                            setMobileOpen((prev) => !prev)
                        }
                    >
                        <IconMenu3 />
                    </Button>
                </nav>
            </section>
            <AnimatePresence>
                {hoveredGroup && (
                    <MegaMenu
                        key={hoveredGroup.label}
                        sections={hoveredGroup.items}
                    />
                )}
            </AnimatePresence>
            <MobileNav
                open={mobileOpen}
                onOpenChange={setMobileOpen}
            />
        </header>
    )
}
