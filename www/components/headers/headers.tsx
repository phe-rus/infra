import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { IconMenu3 } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { config } from "./config"

export const Headers = () => {
    const [open, setOpen] = useState(false)
    const listNavItems = useMemo(() => {
        return config
    }, [])

    const selectedNavItem = useMemo(() => {

    }, [])

    return (
        <>
            <header className={cn("sticky top-0 border-b bg-background", "z-55 border-border/35")}>
                <section
                    className={cn(
                        "px-5 flex items-center justify-between",
                        "h-10 w-full"
                    )}
                >
                    <div className="flex items-center gap-5">
                        <h3 className='text-sm'>Pherus</h3>
                        <nav className="hidden items-center gap-3 md:flex">
                            {listNavItems.map(({ label, to }, idx) => {
                                return (
                                    <Link
                                        key={idx}
                                        to={to}
                                        className={cn("text-sm transition-colors")}
                                        activeProps={{
                                            className: "text-primary!",
                                        }}
                                        activeOptions={{ exact: to === "/" }}
                                    >
                                        {label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    <nav className="flex items-center gap-3">
                        <Button
                            variant="destructive"
                            size="xs"
                        >
                            Logout
                        </Button>
                        <Button
                            size="icon-xs"
                            variant="secondary"
                            className="flex md:hidden"
                        >
                            <IconMenu3 />
                        </Button>
                    </nav>
                </section>
            </header>
            {/** Mega menu */}

            <DialogWidget
                open={open}
                onOpenChange={setOpen}
                title="Quick navigation"
                description="Quick navigation between pages"
                footer={
                    <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                }
            >
                <nav className="flex flex-col">
                    {listNavItems.map(({ label, to }, idx) => {
                        return (
                            <Link
                                key={idx}
                                to={to}
                                className={cn("text-lg transition-colors")}
                                activeProps={{
                                    className: "text-primary!",
                                }}
                                activeOptions={{ exact: to === "/" }}
                                onClick={() => setOpen((prev) => !prev)}
                            >
                                {label}
                            </Link>
                        )
                    })}
                </nav>
            </DialogWidget>
        </>
    )
}