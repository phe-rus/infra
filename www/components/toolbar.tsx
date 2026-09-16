import { m } from "@/paraglide/messages"
import { getLocale, locales, setLocale } from "@/paraglide/runtime"
import { CodeIcon, GalleryThumbnailsIcon, HomeIcon, InfoIcon, Legal01Icon, MoreHorizontal, XIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { buttonVariants } from "@infra/ui/components/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@infra/ui/components/select"
import { useIsMobile } from "@infra/ui/lib/use-media-query"
import { cn } from "@infra/ui/lib/utils"
import { getNativeLanguageName } from "@lib/intl.displayNames"
import { Link, useNavigate } from "@tanstack/react-router"
import { motion } from "motion/react"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"

export const Toolbar = () => {
    const [open, setOpen] = useState(false)
    const isMobile = useIsMobile()
    const navigation = useNavigate()

    const langs = useMemo(() => {
        return Array.from(locales, (value) => ({
            value: value,
            label: getNativeLanguageName(value)
        }))
    }, [])

    const menuList = useMemo(() => {
        return [
            {
                label: m['nav.home'](),
                to: '/',
                Icon: HomeIcon
            },
            {
                label: m['nav.showcase'](),
                to: '/showcase',
                Icon: GalleryThumbnailsIcon
            },
            {
                label: m['nav.about-us'](),
                to: '/about-us',
                Icon: InfoIcon
            },
            {
                label: m['nav.legal.label'](),
                to: '/legal',
                Icon: Legal01Icon,
                items: [
                    { label: m['nav.legal.terms-of-service'](), to: '/legal/terms-of-service' },
                    { label: m['nav.legal.privacy-policy'](), to: '/legal/privacy-policy' },
                    { label: m['nav.legal.cookie-policy'](), to: '/legal/cookie-policy' },
                    { label: m['nav.legal.legal-notice'](), to: '/legal/legal-notice' },
                ]
            },
            {
                label: m['nav.licenses.label'](),
                to: '/licenses',
                Icon: CodeIcon,
                items: [
                    { label: m['nav.licenses.pherus-license'](), to: '/licenses/pherus-license' },
                    { label: m['nav.licenses.mit-license'](), to: '/licenses/mit-license' },
                    { label: m['nav.licenses.apache-2.0-license'](), to: '/licenses/apache-2.0-license' },
                    { label: m['nav.licenses.gpl-3.0-license'](), to: '/licenses/gpl-3.0-license' },
                ]
            }

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
                        <Select
                            items={langs}
                            defaultValue={getLocale()}
                            // biome-ignore lint/suspicious/noExplicitAny: tanstack types are weird
                            onValueChange={(v) => setLocale(v as any)}
                        >
                            <SelectTrigger
                                size='sm'
                                className='w-32 border-border/15! bg-card/15!'
                            >
                                <SelectValue placeholder="Languages" />
                            </SelectTrigger>

                            <SelectContent className='bg-background! ring-border/35!'>
                                <SelectGroup>
                                    <SelectLabel>Languages</SelectLabel>
                                    {langs.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <button
                            type='button'
                            onClick={() => setOpen((prev) => !prev)}
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
                            <div className='relative flex flex-col h-full'>
                                <section className="relative flex flex-col gap-5">
                                    <div className="flex items-center p-5">
                                        <HugeiconsIcon
                                            icon={XIcon}
                                            onClick={() => setOpen((prev) => !prev)}
                                            className={cn(
                                                "text-destructive ml-auto size-6",
                                                'cursor-pointer hover:rotate-45',
                                                'transition-all duration-300 ease-in-out'
                                            )}
                                        />
                                    </div>

                                    <div className="absolute flex flex-col gap-px p-5">
                                        {menuList.map(({ to, Icon, label, items }, index) => {
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className={cn(
                                                        'flex items-center',
                                                        items && 'flex-col items-start'
                                                    )}
                                                >
                                                    <Link
                                                        to={to}
                                                        className={cn(
                                                            'flex items-center gap-2 justify-start',
                                                            'text-2xl font-semibold group'
                                                        )}
                                                        activeProps={{ className: 'text-primary' }}
                                                        onClick={() => {
                                                            setOpen((prev) => !prev)
                                                            navigation({ to: to })
                                                        }}
                                                    >
                                                        <HugeiconsIcon
                                                            icon={Icon}
                                                            className='size-5'
                                                        />
                                                        {label}
                                                    </Link>
                                                    {items && (items?.map((is, ix) => (
                                                        <Link
                                                            key={ix}
                                                            to={is.to}
                                                            className={cn(
                                                                'flex items-center justify-start',
                                                                'text-2xl font-semibold group ml-6 mb-2'
                                                            )}
                                                            activeProps={{ className: 'text-primary' }}
                                                            onClick={() => {
                                                                setOpen((prev) => !prev)
                                                                navigation({ to: is.to })
                                                            }}
                                                        >
                                                            {is.label}
                                                        </Link>
                                                    )))}
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </section>

                                <div className="absolute flex flex-col gap-px bottom-5 p-5">
                                    <p className="text-sm">
                                        Copyright (c) 2026-2027 Pherus Inc.
                                        All rights reserved.
                                    </p>
                                    <p className="text-sm">
                                        MIT License
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>,
                    document.body
                )}
        </>
    )
}