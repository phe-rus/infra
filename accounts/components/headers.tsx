import { NavDrawer } from "@/components/sidebar-drawer"
import { useLogout } from "@/domains/auth"
import { m } from "@/src/paraglide/messages"
import {
    Loading03Icon,
    Menu03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { Link } from "@tanstack/react-router"
import { useState } from "react"

export const Headers = () => {
    const {
        mutateAsync: handleLogout,
        isPending: isLoggingOut,
    } = useLogout()
    const [open, setOpen] = useState(false)

    const listNavItems = [
        {
            label: m["header.nav.general"](),
            to: "/",
        },
        {
            label: m["header.nav.basics"](),
            to: "/profile",
        },
        {
            label: m["header.nav.security"](),
            to: "/security",
        },
    ]

    return (
        <>
            <header
                className={cn(
                    "sticky top-0 border-b bg-background",
                    "z-55 border-border/35"
                )}
            >
                <section
                    className={cn(
                        "container flex items-center justify-between",
                        "h-10 w-full md:max-w-7xl"
                    )}
                >
                    <div className="flex items-center gap-5">
                        <Link
                            to="/"
                            className="text-base font-black"
                        >
                            {m["header.brand"]()}
                        </Link>
                        <nav className="hidden items-center gap-3 md:flex">
                            {listNavItems.map(
                                ({ label, to }, idx) => {
                                    return (
                                        <Link
                                            key={idx}
                                            to={to}
                                            className={cn(
                                                "text-sm transition-colors"
                                            )}
                                            activeProps={{
                                                className:
                                                    "text-primary!",
                                            }}
                                            activeOptions={{
                                                exact:
                                                    to ===
                                                    "/",
                                            }}
                                        >
                                            {label}
                                        </Link>
                                    )
                                }
                            )}
                        </nav>
                    </div>

                    <nav className="flex items-center gap-3">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                                void handleLogout()
                            }
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut && (
                                <HugeiconsIcon
                                    icon={Loading03Icon}
                                    className="animate-spin"
                                />
                            )}
                            {m["header.logout"]()}
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="secondary"
                            className="flex md:hidden"
                            onClick={() =>
                                setOpen((prev) => !prev)
                            }
                            aria-expanded={open}
                            aria-label="Toggle sidebar"
                        >
                            <HugeiconsIcon
                                icon={Menu03Icon}
                            />
                        </Button>
                    </nav>
                </section>
            </header>
            <NavDrawer
                open={open}
                onClose={() => setOpen(false)}
                items={listNavItems}
            />
        </>
    )
}
