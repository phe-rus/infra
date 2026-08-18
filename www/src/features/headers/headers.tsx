import { useLogout } from "@/functions/get-auth"
import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { IconLoader2, IconMenu3 } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"

export const Headers = () => {
    const { mutateAsync: handleLogout, isPending: isLoggingOut } = useLogout()
    const [open, setOpen] = useState(false)

    const listNavItems = useMemo(() => {
        return [
            {
                label: "General",
                to: "/",
            },
            {
                label: "Basics",
                to: "/infro",
            },
            {
                label: "Security & Sign-in",
                to: "/security",
            },
        ]
    }, [])

    return (
        <>
            <header className={cn("sticky top-0 border-b bg-background", "z-55 border-border/35")}>
                <section
                    className={cn(
                        "container flex items-center justify-between",
                        "h-10 w-full md:max-w-7xl"
                    )}
                >
                    <div className="flex items-center gap-5">
                        <Link to="/" className="text-base font-black">
                            Infraccount
                        </Link>
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
                            onClick={() => void handleLogout()}
                            isDisabled={isLoggingOut}
                        >
                            {isLoggingOut && <IconLoader2 className="animate-spin" />}
                            Logout
                        </Button>
                        <Button
                            size="icon-xs"
                            variant="secondary"
                            className="flex md:hidden"
                            onClick={() => setOpen((prev) => !prev)}
                        >
                            <IconMenu3 />
                        </Button>
                    </nav>
                </section>
            </header>
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
