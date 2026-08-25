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
import {
    IconBone,
    IconChevronLeft,
    IconChevronRight,
    IconDownload,
    IconLogs,
    IconMeteorFilled,
    IconMoneybag,
    IconPackage,
    IconSettings,
    IconTerminal,
    IconUpload,
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
    {
        label: "System",
        items: [
            {
                label: "Application",
                path: "/settings",
                Icon: IconSettings,
            },
            {
                label: "Metrics",
                path: "/settings/metrics",
                Icon: IconMeteorFilled,
            },
            {
                label: "Crons",
                path: "/settings/crons",
                Icon: IconBone,
            },
        ],
    },
    {
        label: "Sync",
        items: [
            {
                label: "Export store",
                path: "/settings/sync#export",
                Icon: IconDownload,
            },
            {
                label: "Import store",
                path: "/settings/sync#import",
                Icon: IconUpload,
            },
        ],
    },
    {
        label: "Debug",
        items: [
            {
                label: "SQL console",
                path: "/settings/sql",
                Icon: IconDownload,
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
                                        ({ label, items, ...props }, index) => {
                                            if (!items) {
                                                return (
                                                    <Link
                                                        key={index}
                                                        to={props.path}
                                                        className={cn(
                                                            "group tracking-tight flex items-center gap-2",
                                                            "transition-colors duration-150 ease-out"
                                                        )}
                                                        activeProps={{
                                                            className:
                                                                cn(
                                                                    "text-current"
                                                                ),
                                                        }}
                                                    >
                                                        {props.Icon && (
                                                            <props.Icon className="size-5" />
                                                        )}
                                                        {label}
                                                    </Link>
                                                )
                                            }
                                            return (
                                                <Fragment key={index}>
                                                    <h4 className="pt-3 pb-1 text-sm text-muted-foreground tracking-tight">
                                                        {label}
                                                    </h4>
                                                    <nav className="flex flex-col">
                                                        {items?.map(
                                                            (i, inx) => {
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
                                                                            "transition-colors duration-150 ease-out"
                                                                        )}
                                                                        activeProps={{
                                                                            className:
                                                                                cn(
                                                                                    "text-current"
                                                                                ),
                                                                        }}
                                                                    >
                                                                        <i.Icon className="size-5" />
                                                                        {
                                                                            i.label
                                                                        }
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
