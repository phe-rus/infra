import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { IconMenu3, IconNotes } from "@tabler/icons-react"
import { useLocation } from "@tanstack/react-router"
import { AnimatePresence } from "motion/react"
import { useMemo, useState } from "react"
import { config, isNavGroup } from "./config"
import { MegaMenu } from "./views/mega-menu"
import { MobileNav } from "./views/mobile-nav"
import { NavTrigger } from "./views/nav-trigger"

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
                        {config.map((item, idx) =>
                            isNavGroup(item) ? (
                                <NavTrigger
                                    key={idx}
                                    label={item.label}
                                    active={
                                        hoveredLabel ===
                                        item.label
                                    }
                                    onMouseEnter={() =>
                                        setHoveredLabel(
                                            item.label
                                        )
                                    }
                                />
                            ) : (
                                <NavTrigger
                                    key={idx}
                                    label={item.label}
                                    to={item.to}
                                    active={isActive(item.to)}
                                    onMouseEnter={() =>
                                        setHoveredLabel(null)
                                    }
                                />
                            )
                        )}
                    </nav>
                </div>

                <nav className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="xs"
                        className="rounded-full"
                    >
                        <IconNotes />
                        Documentation
                    </Button>
                    <Button
                        size="icon-xs"
                        variant="secondary"
                        className="flex md:hidden rounded-full"
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
