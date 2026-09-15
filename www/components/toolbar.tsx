import { MoreHorizontal, XIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button, buttonVariants } from "@infra/ui/components/button"
import { useIsMobile } from "@infra/ui/lib/use-media-query"
import { cn } from "@infra/ui/lib/utils"
import { Link, useNavigate } from "@tanstack/react-router"
import { motion } from "motion/react"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"

export const Toolbar = () => {
    const [open, setOpen] = useState(false)
    const isMobile = useIsMobile()
    const navigation = useNavigate()

    const menuList = useMemo(() => {
        return [
            { label: 'Home', to: '/' },
            { label: 'Showcase', to: '/showcase' },
            { label: 'About us', to: '/about-us' },
        ]
    }, [])

    return (
        <>
            <motion.header
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    'sticky flex top-0 bg-background/20 backdrop-blur-sm border-b',
                    'border-border/35 select-none z-10'
                )}
            >
                <section className='px-5 flex items-center justify-between w-full h-11'>
                    <div className='flex items-center gap-5'>
                        <div
                            onClick={() => navigation({ to: '/' })}
                            className='flex items-center gap-1 cursor-pointer'
                        >
                            <picture>
                                <img
                                    src="/favicon.svg"
                                    alt="Pherus"
                                    className="size-4 dark:hidden"
                                    data-not-typeset
                                />
                                <img
                                    src="/favicon_light.png"
                                    alt="Pherus"
                                    className="size-4 hidden dark:block"
                                    data-not-typeset
                                />
                            </picture>
                            <h1 className='text-lg font-bold'>
                                Pherus
                            </h1>
                        </div>
                    </div>

                    <nav className='flex items-center gap-1'>
                        <button
                            type='button'
                            onClick={() => setOpen((prev) => !prev)}
                            // prevent focus change on mobile devices
                            onTouchStart={(e) => e.preventDefault()}
                            onPointerDown={(e) => e.preventDefault()}
                            title='More'
                            aria-expanded={open}
                            aria-label='Toggle sidebar'
                            className={cn(buttonVariants({
                                variant: 'ghost',
                                size: 'icon'
                            }))}
                        >
                            <HugeiconsIcon icon={MoreHorizontal} />
                        </button>
                    </nav>
                </section>
            </motion.header>
            {open &&
                createPortal(
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                'fixed inset-0 z-50 bg-background/15',
                                'backdrop-blur-xs cursor-pointer'
                            )}
                            onClick={() => setOpen(false)}
                        />

                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                            className={cn(
                                "fixed top-0 z-50 bg-background border-l border-border/25",
                                'shadow hover:shadow-md',
                                isMobile ? 'right-0 w-screen h-dvh' : 'right-0 w-96 h-screen'
                            )}
                        >
                            <section className="relative flex flex-col gap-5">
                                <div className="flex items-center p-5">
                                    <Button
                                        variant="ghost"
                                        size="icon-lg"
                                        className="ml-auto rounded-full group"
                                        onClick={() => setOpen((prev) => !prev)}
                                    >
                                        <HugeiconsIcon icon={XIcon} className="text-destructive" />
                                    </Button>
                                </div>

                                <div className="absolute flex flex-col gap-px p-5">
                                    {menuList.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ delay: index * 0.1 }}
                                            className='flex items-center'
                                        >
                                            <Link
                                                to={item.to}
                                                className={cn('justify-start', 'text-2xl font-semibold')}
                                                activeProps={{ className: 'text-primary' }}
                                                onClick={() => {
                                                    setOpen((prev) => !prev)
                                                    navigation({ to: item.to })
                                                }}
                                            >
                                                {item.label}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    </>,
                    document.body
                )}
        </>
    )
}