import { useLogout } from "@/functions/get-auth"
import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { IconLoader2 } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import { useMemo } from "react"

export const Headers = () => {
    const {
        mutateAsync: handleLogout,
        isPending: isLoggingOut
    } = useLogout()

    const listNavItems = useMemo(() => {
        return [
            {
                label: 'General',
                to: '/',
            },
            {
                label: 'Basics',
                to: '/infro'
            },
            {
                label: 'Security & Sign-in',
                to: '/security'
            },
        ]
    }, [])

    return (
        <header className={cn(
            'sticky top-0 bg-background border-b',
            'border-border/35 z-55'
        )}>
            <section className={cn(
                'container flex items-center justify-between',
                'md:max-w-7xl w-full h-10'
            )}>
                <div className='flex items-center gap-5'>
                    <h1 className='text-base font-black'>Infraccount</h1>
                    <nav className='flex items-center gap-3'>
                        {listNavItems.map(({ label, to }, idx) => {
                            return (
                                <Link
                                    key={idx}
                                    to={to}
                                    className={cn(
                                        'transition-colors text-sm'
                                    )}
                                    activeProps={{
                                        className: 'text-primary!'
                                    }}
                                    activeOptions={{ exact: to === "/" }}
                                >
                                    {label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <nav className='flex items-center gap-3'>
                    <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => void handleLogout()}
                        isDisabled={isLoggingOut}
                    >
                        {isLoggingOut && <IconLoader2 className='animate-spin' />}
                        Logout
                    </Button>
                </nav>
            </section>
        </header>
    )
}