import { createContext, useContext, type PropsWithChildren, type FC, useState, useRef, useEffect, useCallback } from "react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useIsMobile } from "@/lib/use-media-query"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { useLogout, useMeOptions } from "@/hooks/authHooks"
import { useStopImpersonating } from "@/hooks/usersHooks"
import { useSuspenseQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

type DashboardProps = PropsWithChildren<{}>
type SidebarProps = {
    open: boolean
    setOpen: (open: boolean) => void
}
const SidebarContext = createContext<SidebarProps | null>(null)
export const Dashboard: FC<DashboardProps> = ({
    children
}) => {
    const { isPending, mutateAsync: signOut } = useLogout()
    const { data: session } = useSuspenseQuery(useMeOptions())
    const { mutateAsync: stopImpersonating, isPending: isStoppingImpersonation } = useStopImpersonating()
    const impersonatedBy = session?.session.impersonatedBy
    const [open, setOpen] = useState<boolean>(true)
    const ref = useRef<HTMLDivElement>(null)
    const isMobile = useIsMobile()

    const toggleSidebar = useCallback(() => {
        setOpen((prev) => !prev)
    }, [])

    useEffect(() => {
        if (!isMobile) {
            setOpen(true)
        }
    }, [isMobile])

    const navLists = [
        {
            label: "Providers",
            path: "/providers"
        },
        {
            label: "Users",
            path: "/users"
        },
        {
            label: "Database",
            path: "/database"
        },
        {
            label: "Storage",
            path: "/storage"
        },
        {
            label: "API keys",
            path: "/api-keys"
        },
        {
            label: "Environment variables",
            path: "/environment-variables"
        },
        {
            label: "Teams & roles",
            path: "/team-roles"
        },
        {
            label: "Logs",
            path: "/logs"
        },
        {
            label: "Billing",
            path: "/billing"
        }
    ]

    return (
        <SidebarContext.Provider value={{
            open: open,
            setOpen: toggleSidebar
        }}>
            <div className='fixed inset-0 overflow-hidden'>
                <main className='relative flex w-full h-svh overflow-hidden'>
                    {open && (
                        <div
                            className={cn(
                                "fixed inset-0 backdrop-blur-sm",
                                "backdrop-blur-xs z-30 md:hidden"
                            )}
                            onClick={toggleSidebar}
                        />
                    )}
                    <aside
                        ref={ref}
                        className={cn(
                            "fixed md:relative shrink-0 h-full border-r backdrop-blur bg-background/85 shadow-sm",
                            "transition-transform duration-300 ease-in-out ease-initial border-primary/5 z-55",
                            'inset-y-0',
                            open ? "translate-x-0 w-78" : "-translate-x-full w-fit"
                        )}
                    >
                        <Button
                            size="icon-xs"
                            variant='secondary'
                            className={cn(
                                "absolute top-10 -translate-y-1/2 z-56 cursor-pointer",
                                "transition-all duration-300 select-none rounded-full",
                                !open && 'hidden md:flex',
                                open
                                    ? "left-full -translate-x-1/2"
                                    : "left-[calc(100%+8px)] translate-x-0.5"
                            )}
                            onClick={() => toggleSidebar()}
                        >
                            {!open ? <IconChevronRight /> : <IconChevronLeft />}
                        </Button>
                        <section className={cn(
                            "p-5 flex-col min-h-svh gap-5",
                            !open ? "hidden" : "flex"
                        )}>
                            <section className='flex flex-col gap-5 p-5'>
                                <nav>
                                    <Link to='/' className={cn(
                                        'text-primary text-2xl',
                                        'hover:text-primary/65'
                                    )}>Infra</Link>
                                </nav>
                                <nav className='flex flex-col'>
                                    {navLists.map((nav, index) => (
                                        <Link
                                            key={index}
                                            to={nav.path}
                                            className='text-lg'
                                            activeProps={{
                                                className: 'text-primary!'
                                            }}
                                        >
                                            {nav.label}
                                        </Link>
                                    ))}
                                </nav>
                            </section>
                            <span className="flex-1" />
                            <nav className={cn(
                                'sticky bottom-0 p-5 mb-auto',
                                'flex flex-col'
                            )}>
                                <Button
                                    className='w-fit!'
                                    onClick={() => signOut({})}
                                    isDisabled={isPending}
                                >
                                    {isPending ? "Signing out..." : "Sign out"}
                                </Button>
                            </nav>
                        </section>
                    </aside>
                    <div className='relative flex flex-col flex-1 overflow-y-auto no-scrollbar'>
                        {impersonatedBy && (
                            <div className='sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-destructive/10 px-5 py-2 text-xs text-destructive'>
                                <span>
                                    Impersonating <strong>{session?.user.name}</strong> ({session?.user.email})
                                </span>
                                <Button
                                    size='xs'
                                    variant='outline'
                                    onClick={() => void stopImpersonating({})}
                                    isDisabled={isStoppingImpersonation}
                                >
                                    {isStoppingImpersonation ? "Stopping…" : "Stop impersonating"}
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
