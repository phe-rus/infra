import {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
    useCallback,
} from "react"
import type { PropsWithChildren, FC } from "react"
import {
    IconChevronLeft,
    IconChevronRight,
    IconLogs,
    IconMoneybag,
    IconPackage,
    IconTerminal,
    IconUser,
} from "@tabler/icons-react"
import { useIsMobile } from "@infra/ui/lib/use-media-query"
import { Button } from "@infra/ui/components/button"
import { Link } from "@tanstack/react-router"
import { useLogout, meOptions } from "@/domains/auth"
import { useStopImpersonating } from "@/domains/users"
import { useSuspenseQuery } from "@tanstack/react-query"
import { cn } from "@infra/ui/lib/utils"

type DashboardProps = PropsWithChildren
type SidebarProps = {
    open: boolean
    setOpen: (open: boolean) => void
}
const SidebarContext = createContext<SidebarProps | null>(null)
const navLists = [
    {
        label: "Users",
        path: "/users",
        Icon: IconUser,
    },
    {
        label: "Console",
        path: "/console",
        Icon: IconTerminal,
    },
    {
        label: "Storage",
        path: "/storage",
        Icon: IconPackage,
    },
    {
        label: "Logs",
        path: "/logs",
        Icon: IconLogs,
    },
    {
        label: "Billing",
        path: "/billing",
        Icon: IconMoneybag,
    },
]
export const Dashboard: FC<DashboardProps> = ({ children }) => {
    const { isPending, mutateAsync: signOut } = useLogout()
    const { data: session } = useSuspenseQuery(meOptions())
    const {
        mutateAsync: stopImpersonating,
        isPending: isStoppingImpersonation,
    } = useStopImpersonating()
    const impersonatedBy = session?.session.impersonatedBy
    const [open, setOpen] = useState<boolean>(true)
    const [isPeeking, setIsPeeking] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const isMobile = useIsMobile()

    const toggleSidebar = useCallback(() => {
        setOpen((prev) => !prev)
        setIsPeeking(false)
    }, [])

    useEffect(() => {
        if (!isMobile) {
            setOpen(true)
        }
    }, [isMobile])

    const isExpanded = open || isPeeking

    return (
        <SidebarContext.Provider
            value={{
                open: open,
                setOpen: toggleSidebar,
            }}
        >
            <div className="fixed inset-0 overflow-hidden">
                <main className="relative flex h-svh w-full overflow-hidden">
                    {open && (
                        <div
                            className={cn(
                                "fixed inset-0 backdrop-blur-sm",
                                "z-30 backdrop-blur-xs md:hidden"
                            )}
                            onClick={toggleSidebar}
                        />
                    )}
                    <aside
                        ref={ref}
                        onMouseEnter={() => {
                            if (!open && !isMobile) setIsPeeking(true)
                        }}
                        onMouseLeave={() => setIsPeeking(false)}
                        className={cn(
                            "fixed h-full shrink-0 border-r bg-secondary/5 shadow-md",
                            "border-primary/5 inset-y-0 backdrop-blur-3xl",
                            "transition-all duration-300 ease-in-out ease-initial",
                            "will-change-transform will-change-backdrop-filter",
                            // Prevent layout shifts by keeping width constant (w-72)
                            // and using md:absolute for peeking/closed states so it overlays.
                            open
                                ? "w-72 translate-x-0 z-55 md:relative"
                                : isPeeking
                                  ? "w-72 translate-x-0 z-55 md:absolute shadow-2xl"
                                  : "w-72 -translate-x-full z-10 md:absolute"
                        )}
                    >
                        <Button
                            size="icon-xs"
                            variant="secondary"
                            aria-label={
                                isExpanded
                                    ? "Collapse sidebar"
                                    : "Expand sidebar"
                            }
                            className={cn(
                                "absolute top-5 z-56 -translate-y-1/2 cursor-pointer",
                                "rounded-full transition-all duration-300 select-none",
                                !isExpanded && "hidden md:flex",
                                isExpanded
                                    ? "left-full -translate-x-1/2"
                                    : "left-[calc(100%+8px)] translate-x-0.5"
                            )}
                            onClick={() => toggleSidebar()}
                        >
                            {!isExpanded ? (
                                <IconChevronRight />
                            ) : (
                                <IconChevronLeft />
                            )}
                        </Button>
                        <section
                            className={cn(
                                "min-h-svh flex-col gap-5 px-5 py-2",
                                !isExpanded ? "hidden" : "flex"
                            )}
                        >
                            <section className="flex flex-col gap-3">
                                <nav className="flex items-center gap-1">
                                    <Link
                                        to="/"
                                        className={cn(
                                            "flex gap-1 items-center text-xl text-primary font-bold",
                                            "hover:text-primary/65 tracking-wider"
                                        )}
                                    >
                                        <img
                                            src="/favicon.svg"
                                            alt="Infra"
                                            className="size-4.5 mix-blend-normal rounded-full!"
                                        />
                                        Infra
                                    </Link>
                                </nav>
                                <nav className="flex flex-col">
                                    {navLists.map((nav, index) => (
                                        <Link
                                            key={index}
                                            to={nav.path}
                                            className={cn(
                                                "group tracking-tight flex items-center gap-2",
                                                "transition-colors duration-150 ease-out"
                                            )}
                                            activeProps={{
                                                className: "text-current",
                                            }}
                                        >
                                            <nav.Icon className="size-5" />
                                            {nav.label}
                                        </Link>
                                    ))}
                                </nav>
                            </section>
                            <span className="flex-1" />
                            <nav
                                className={cn(
                                    "sticky bottom-0 mb-auto",
                                    "flex flex-col"
                                )}
                            >
                                <Button
                                    className="w-fit!"
                                    variant="destructive"
                                >
                                    API
                                </Button>
                                <Button
                                    className="w-fit!"
                                    onClick={() => signOut({})}
                                    isDisabled={isPending}
                                >
                                    {isPending ? "Signing out..." : "Sign out"}
                                </Button>
                            </nav>
                        </section>
                    </aside>
                    <div className="relative no-scrollbar flex flex-1 flex-col overflow-y-auto">
                        {impersonatedBy && (
                            <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-destructive/10 px-5 py-2 text-xs text-destructive">
                                <span>
                                    Impersonating{" "}
                                    <strong>{session.user.name}</strong> (
                                    {session.user.email})
                                </span>
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => void stopImpersonating({})}
                                    isDisabled={isStoppingImpersonation}
                                >
                                    {isStoppingImpersonation
                                        ? "Stopping…"
                                        : "Stop impersonating"}
                                </Button>
                            </div>
                        )}
                        {children}
                    </div>
                </main>
            </div>
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error("useDashboardContext must be used within Dashboard")
    }
    return context
}
