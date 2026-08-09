import { type PropsWithChildren, type FC } from "react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DashboardProps = PropsWithChildren<{}>

export const Dashboard: FC<DashboardProps> = ({
    children
}) => {
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
        <main className='fixed flex inset-0'>
            <aside className={cn(
                'flex flex-col w-78 leading-loose',
                'relative h-dvh overflow-y-auto',
                'no-scrollbar scroll-smooth'
            )}>
                <section className='flex flex-col gap-5 p-5'>
                    <nav>
                        <h1>Pherus</h1>
                    </nav>
                    <nav className='flex flex-col'>
                        {navLists.map(nav => (
                            <Link
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
            </aside>
            <article className='flex-1'>
                {children}
            </article>
        </main >
    )
}