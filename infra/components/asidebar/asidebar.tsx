import {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
    useCallback,
    Fragment,
} from "react"
import type { PropsWithChildren, FC } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Activity01Icon,
    Bone01Icon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Comet01Icon,
    Download01Icon,
    Message02Icon,
    PackageIcon,
    Settings01Icon,
    TerminalIcon,
    Upload01Icon,
    UserIcon,
} from "@hugeicons/core-free-icons"
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
        Icon: UserIcon,
    },
    {
        label: "Console",
        path: "/console",
        Icon: TerminalIcon,
    },
    {
        label: "Storage",
        path: "/storage",
        Icon: PackageIcon,
    },
    {
        label: "Logs",
        path: "/logs",
        Icon: Activity01Icon,
    },
    {
        isDev: true,
        label: "Messaging",
        path: "/messaging",
        Icon: Message02Icon,
    },
    {
        label: "System",
        items: [
            {
                isDev: true,
                label: "Application",
                path: "/settings",
                Icon: Settings01Icon,
            },
            {
                isDev: true,
                label: "Metrics",
                path: "/settings/metrics",
                Icon: Comet01Icon,
            },
            {
                isDev: true,
                label: "Crons",
                path: "/settings/crons",
                Icon: Bone01Icon,
            },
        ],
    },
    {
        label: "Sync",
        items: [
            {
                isDev: true,
                label: "Export store",
                path: "/settings/sync#export",
                Icon: Download01Icon,
            },
            {
                isDev: true,
                label: "Import store",
                path: "/settings/sync#import",
                Icon: Upload01Icon,
            },
        ],
    },
    {
        label: "Debug",
        items: [
            {
                isDev: true,
                label: "SQL console",
                path: "/settings/sql",
                Icon: Download01Icon,
            },
        ],
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
                            "fixed h-full shrink-0 border-r bg-muted/15 shadow-md",
                            "border-border/15 inset-y-0 backdrop-blur-3xl z-55",
                            "transition-all duration-300 ease-in-out ease-initial",
                            "will-change-transform will-change-backdrop-filter",
                            "shadow shadow-muted",
                            open
                                ? "w-72 translate-x-0 z-55 md:relative"
                                : isPeeking
                                  ? "w-72 translate-x-0 z-55 md:absolute shadow-2xl"
                                  : "w-72 -translate-x-full z-10 md:absolute"
                        )}
                    >
                        <Button
                            size={open ? "icon-xs" : "icon-sm"}
                            variant="secondary"
                            aria-label={
                                isExpanded
                                    ? "Collapse sidebar"
                                    : "Expand sidebar"
                            }
                            className={cn(
                                "absolute top-5 z-56 -translate-y-1/2 cursor-pointer",
                                "rounded-full transition-all duration-300 select-none",
                                !isExpanded && "flex",
                                isExpanded
                                    ? "left-full -translate-x-1/2"
                                    : "left-[calc(100%+8px)] translate-x-0.5"
                            )}
                            onClick={() => toggleSidebar()}
                        >
                            {!isExpanded ? (
                                <HugeiconsIcon icon={ChevronRightIcon} />
                            ) : (
                                <HugeiconsIcon icon={ChevronLeftIcon} />
                            )}
                        </Button>
                        <section
                            className={cn(
                                "min-h-svh flex-col gap-5 px-5 py-2",
                                !isExpanded ? "hidden" : "flex"
                            )}
                        >
                            <section className="flex flex-col gap-2">
                                <nav className="flex items-center gap-1">
                                    <Link
                                        to="/"
                                        className={cn(
                                            "flex gap-1 items-center text-lg text-primary",
                                            "hover:text-primary/65 tracking-wider font-bold",
                                            "px-1"
                                        )}
                                    >
                                        <img
                                            src="/favicon.svg"
                                            alt="Infra"
                                            className={cn(
                                                "size-4.5 mix-blend-normal rounded-full!"
                                            )}
                                        />
                                        Infra
                                    </Link>
                                </nav>
                                <nav className="flex flex-col">
                                    {navLists.map(
                                        (
                                            { label, items, ...props },
                                            index
                                        ) => {
                                            if (!items) {
                                                return (
                                                    <Link
                                                        key={index}
                                                        to={props.path}
                                                        className={cn(
                                                            "group tracking-tight flex items-center gap-2",
                                                            "transition-colors duration-150 ease-out",
                                                            "relative",
                                                            props.isDev &&
                                                                "duration-150 opacity-60"
                                                        )}
                                                        activeProps={{
                                                            className:
                                                                cn(
                                                                    "text-current",
                                                                    props.isDev &&
                                                                        "opacity-100"
                                                                ),
                                                        }}
                                                    >
                                                        {props.Icon && (
                                                            <HugeiconsIcon icon={props.Icon} className="size-5" />
                                                        )}
                                                        {label}
                                                        {props.isDev && (
                                                            <span
                                                                className={cn(
                                                                    "absolute -top-0.5 right-3 text-[5px] bg-destructive/45",
                                                                    "text-destructive-foreground rounded-2xl",
                                                                    "px-1 py-0.5"
                                                                )}
                                                            >
                                                                comming
                                                                soon
                                                            </span>
                                                        )}
                                                    </Link>
                                                )
                                            }
                                            return (
                                                <Fragment key={index}>
                                                    <h4 className="pt-3 pb-1 text-sm font-light tracking-tight">
                                                        {label}
                                                    </h4>
                                                    <nav className="flex flex-col">
                                                        {items?.map(
                                                            (
                                                                i,
                                                                inx
                                                            ) => {
                                                                return (
                                                                    <Link
                                                                        key={
                                                                            inx
                                                                        }
                                                                        to={
                                                                            i.path
                                                                        }
                                                                        className={cn(
                                                                            "group tracking-tight flex items-center gap-2",
                                                                            "transition-colors duration-150 ease-out",
                                                                            "relative",
                                                                            i.isDev &&
                                                                                "duration-150 opacity-60"
                                                                        )}
                                                                        activeProps={{
                                                                            className:
                                                                                cn(
                                                                                    "text-current",
                                                                                    i.isDev &&
                                                                                        "opacity-100"
                                                                                ),
                                                                        }}
                                                                    >
                                                                        <HugeiconsIcon icon={i.Icon} className="size-5" />
                                                                        {
                                                                            i.label
                                                                        }
                                                                        {i.isDev && (
                                                                            <span
                                                                                className={cn(
                                                                                    "absolute -top-0.5 right-3 text-[5px] bg-destructive/45",
                                                                                    "text-destructive-foreground rounded-2xl",
                                                                                    "px-1 py-0.5"
                                                                                )}
                                                                            >
                                                                                comming
                                                                                soon
                                                                            </span>
                                                                        )}
                                                                    </Link>
                                                                )
                                                            }
                                                        )}
                                                    </nav>
                                                </Fragment>
                                            )
                                        }
                                    )}
                                </nav>
                            </section>
                            <span className="flex-1" />
                            <nav
                                className={cn(
                                    "sticky bottom-0 mb-auto",
                                    "flex flex-col gap-3"
                                )}
                            >
                                <Button
                                    size="sm"
                                    className="w-fit!"
                                    onClick={() => signOut()}
                                    disabled={isPending}
                                >
                                    {isPending
                                        ? "Signing out..."
                                        : "Sign out"}
                                </Button>
                            </nav>
                        </section>
                    </aside>
                    <div className="relative no-scrollbar flex flex-1 flex-col overflow-y-auto">
                        {impersonatedBy && (
                            <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-destructive/10 px-5 py-2 text-xs text-destructive">
                                <span>
                                    Impersonating{" "}
                                    <strong>{session.user.name}</strong>{" "}
                                    ({session.user.email})
                                </span>
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() =>
                                        void stopImpersonating()
                                    }
                                    disabled={isStoppingImpersonation}
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
        throw new Error(
            "useDashboardContext must be used within Dashboard"
        )
    }
    return context
}
