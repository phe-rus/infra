import { meOptions, useLogout } from "@/domains/auth"
import { useInstanceSettings } from "@/domains/settings"
import { useStopImpersonating } from "@/domains/users"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@infra/ui/components/button"
import { useIsMobile } from "@infra/ui/lib/use-media-query"
import { cn } from "@infra/ui/lib/utils"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import type { FC, PropsWithChildren } from "react"
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import { config } from "./config"
import { NavGroupSection, NavLink } from "./nav-items"

type DashboardProps = PropsWithChildren
type SidebarProps = {
    open: boolean
    setOpen: (open: boolean) => void
}
const SidebarContext = createContext<SidebarProps | null>(
    null
)

// Read only after mount (useEffect), never in a useState initializer: that
// runs during SSR too, where localStorage doesn't exist, and reading it on
// the client's first render (before the persisted value is known) would
// disagree with the server-rendered markup and trip a hydration mismatch.
const SIDEBAR_OPEN_KEY = "infra:sidebar-open"
const SIDEBAR_COLLAPSED_GROUPS_KEY =
    "infra:sidebar-collapsed-groups"

function readStoredOpen(): boolean {
    try {
        const stored = localStorage.getItem(SIDEBAR_OPEN_KEY)
        return stored === null ? true : stored === "true"
    } catch {
        return true
    }
}

function readStoredCollapsedGroups(): Set<string> {
    try {
        const stored = localStorage.getItem(
            SIDEBAR_COLLAPSED_GROUPS_KEY
        )
        return stored
            ? new Set(JSON.parse(stored))
            : new Set()
    } catch {
        return new Set()
    }
}

export const Dashboard: FC<DashboardProps> = ({
    children,
}) => {
    const { isPending, mutateAsync: signOut } = useLogout()
    const { data: session } = useSuspenseQuery(meOptions())
    const { data: settings } = useInstanceSettings()
    const {
        mutateAsync: stopImpersonating,
        isPending: isStoppingImpersonation,
    } = useStopImpersonating()
    const impersonatedBy = session?.session.impersonatedBy
    const [open, setOpen] = useState<boolean>(true)
    const [isPeeking, setIsPeeking] = useState(false)
    const [collapsedGroups, setCollapsedGroups] = useState<
        Set<string>
    >(new Set())
    const ref = useRef<HTMLDivElement>(null)
    const isMobile = useIsMobile()

    const toggleSidebar = useCallback(() => {
        setOpen((prev) => {
            const next = !prev
            try {
                localStorage.setItem(
                    SIDEBAR_OPEN_KEY,
                    String(next)
                )
            } catch { }
            return next
        })
        setIsPeeking(false)
    }, [])

    const toggleGroup = useCallback((label: string) => {
        setCollapsedGroups((prev) => {
            const next = new Set(prev)
            if (next.has(label)) next.delete(label)
            else next.add(label)
            try {
                localStorage.setItem(
                    SIDEBAR_COLLAPSED_GROUPS_KEY,
                    JSON.stringify([...next])
                )
            } catch { }
            return next
        })
    }, [])

    useEffect(() => {
        setCollapsedGroups(readStoredCollapsedGroups())
    }, [])

    useEffect(() => {
        if (!isMobile) {
            setOpen(readStoredOpen())
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
                            if (!open && !isMobile)
                                setIsPeeking(true)
                        }}
                        onMouseLeave={() =>
                            setIsPeeking(false)
                        }
                        className={cn(
                            "fixed h-full shrink-0 border-r bg-muted/15 shadow-md",
                            "border-border/15 inset-y-0 backdrop-blur-3xl z-55",
                            "transition-all duration-300 ease-in-out ease-initial",
                            "will-change-transform will-change-backdrop-filter",
                            "shadow shadow-muted",
                            open
                                ? "w-78 translate-x-0 z-55 md:relative"
                                : isPeeking
                                    ? "w-78 translate-x-0 z-55 md:absolute shadow-2xl"
                                    : "w-78 -translate-x-full z-10 md:absolute"
                        )}
                    >
                        <Button
                            size={
                                open ? "icon-xs" : "icon-sm"
                            }
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
                                <HugeiconsIcon
                                    icon={ChevronRightIcon}
                                />
                            ) : (
                                <HugeiconsIcon
                                    icon={ChevronLeftIcon}
                                />
                            )}
                        </Button>
                        <section
                            className={cn(
                                "min-h-svh flex-col gap-5 px-3 py-2",
                                !isExpanded
                                    ? "hidden"
                                    : "flex"
                            )}
                        >
                            <section className="flex flex-col gap-2">
                                <nav className="flex items-center gap-1">
                                    <Link
                                        to="/"
                                        className={cn(
                                            "flex gap-1.5 items-center text-primary",
                                            "hover:text-primary/65 tracking-wider font-bold",
                                            "px-3"
                                        )}
                                    >
                                        <img
                                            src={
                                                settings.logoUrl ??
                                                "/favicon.svg"
                                            }
                                            alt={
                                                settings.displayName
                                            }
                                            className="size-4.5 mix-blend-normal rounded-full!"
                                        />
                                        {settings.displayName}
                                    </Link>
                                </nav>
                                <nav className="flex flex-col">
                                    {config.map((entry) =>
                                        "items" in entry ? (
                                            <NavGroupSection
                                                key={
                                                    entry.label
                                                }
                                                {...entry}
                                                isCollapsed={collapsedGroups.has(
                                                    entry.label
                                                )}
                                                onToggle={() =>
                                                    toggleGroup(
                                                        entry.label
                                                    )
                                                }
                                            />
                                        ) : (
                                            <NavLink
                                                key={
                                                    entry.label
                                                }
                                                {...entry}
                                            />
                                        )
                                    )}
                                </nav>
                            </section>
                            <span className="flex-1" />
                            <nav
                                className={cn(
                                    "sticky bottom-0 mb-auto",
                                    "flex flex-col gap-2"
                                )}
                            >
                                <div className="flex flex-col gap-0.5 px-1 text-xs">
                                    <span className="truncate font-medium">
                                        {session?.user.name}
                                    </span>
                                    <span className="truncate text-muted-foreground">
                                        {session?.user.email}
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    className="w-fit!"
                                    variant="destructive"
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
                                    <strong>
                                        {session.user.name}
                                    </strong>{" "}
                                    ({session.user.email})
                                </span>
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() =>
                                        void stopImpersonating()
                                    }
                                    disabled={
                                        isStoppingImpersonation
                                    }
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
