import { createContext, useContext, type PropsWithChildren, type FC, useState, useRef, useEffect, useCallback } from "react"
import { useIsMobile } from "@/lib/use-media-query"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

type DashboardProps = PropsWithChildren<{}>
type SidebarProps = {}
const SidebarContext = createContext<SidebarProps | null>(null)
export function useSidebar() {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error("useDashboardContext must be used within Dashboard")
    }
    return context
}

export const Dashboard: FC<DashboardProps> = ({
    children
}) => {
    const [open, setOpen] = useState<boolean>(false)
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
            path: "."
        },
        {
            label: "Users",
            path: "."
        },
        {
            label: "Database",
            path: "."
        },
        {
            label: "Storage",
            path: "."
        },
        {
            label: "API keys",
            path: "."
        },
        {
            label: "Environment variables",
            path: "."
        },
        {
            label: "Team & roles",
            path: "."
        },
        {
            label: "Logs",
            path: "."
        },
        {
            label: "Billing",
            path: "."
        }
    ]

    return (
        <SidebarContext.Provider value={{}}>
            <main className='relative flex w-svw h-svh overflow-hidden'>
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
                        onClick={toggleSidebar}
                    >
                        {!open ? <IconChevronRight /> : <IconChevronLeft />}
                    </Button>
                    <section className={cn(
                        "p-5 flex-col min-h-svh gap-5",
                        !open ? "hidden" : "flex"
                    )}>
                        <section className='flex flex-col gap-5 p-5'>
                            <nav>
                                <h1>Pherus</h1>
                            </nav>
                            <nav className='flex flex-col'>
                                {navLists.map((nav, index) => (
                                    <Link
                                        key={index}
                                        to={nav.path}
                                        className='text-xl'
                                        activeOptions={{
                                            exact: true,
                                            includeHash: true,
                                            includeSearch: true
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
                            <Button className='w-fit!'>Sign out</Button>
                            <Button variant='secondary' className='w-fit!'>Create provider</Button>
                        </nav>
                    </section>
                </aside>
                <article className='relative flex flex-col flex-1 overflow-y-auto no-scrollbar'>
                    {children}
                </article>
            </main >
        </SidebarContext.Provider>
    )
}