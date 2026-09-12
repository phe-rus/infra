import { Closing } from "@/components/closing"
import { EcosystemSpine } from "@/components/ecosystem-spine"
import { getDictionary } from "@/lib/i18n"
import { cn } from "@infra/ui/lib/utils"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion, useReducedMotion } from "motion/react"
import { useMemo } from "react"

export const Route = createFileRoute("/_public/")({
    component: RouteComponent,
})

const EASE = [0.16, 1, 0.3, 1] as const

function RouteComponent() {
    const t = getDictionary()
    const reduced = useReducedMotion()

    const fade = useMemo(
        () => ({
            hidden: { opacity: 0, y: reduced ? 0 : 14 },
            visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: EASE },
            },
        }),
        [reduced]
    )

    return (
        <article className="flex flex-col">
            <motion.section
                initial="hidden"
                animate="visible"
                variants={fade}
                className="container flex w-full flex-col items-center gap-5 py-16 text-center md:py-24"
            >
                <div className="flex flex-col items-center mx-auto max-w-2xl">
                    <span className="size-3 rounded-full bg-foreground" />
                    <h1 className="text-2xl md:text-4xl tracking-tight leading-[1.1] text-center">
                        {t.home.thesis}
                    </h1>
                    <p className="text-center text-muted-foreground leading-relaxed md:max-w-md">
                        {t.home.principle}
                    </p>
                </div>
                <span
                    aria-hidden
                    className="mt-2 h-18 w-px bg-primary/15"
                />
            </motion.section>

            <section className="container flex w-full flex-col items-center gap-5 text-center">
                <div className="flex flex-col gap-5 items-center mx-auto max-w-2xl">
                    <h2 className="tracking-tight leading-[1.1] text-center">
                        {t.home.whatAndwhomWeWorkWith.headline}
                    </h2>

                    {/* infinate scroll of logos */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fade}
                        className={cn(
                            'w-full max-w-5xl overflow-hidden',
                            'relative select-none'
                        )}
                    >
                        <motion.div
                            animate={{ x: ['0%', '-50%'] }}
                            transition={{
                                duration: 20,
                                ease: 'linear',
                                repeat: Infinity,
                                repeatDelay: 0
                            }}
                            className="flex w-max"
                        >
                            <div className="flex items-center justify-start gap-12 pr-12">
                                {t.home.whatAndwhomWeWorkWith.list.map((tech) => (
                                    <a
                                        key={tech.label}
                                        href={tech.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            'flex items-center gap-2 text-black/50 dark:text-white/50',
                                            'grayscale hover:grayscale-0 hover:text-black dark:hover:text-white',
                                            'transition-all opacity-60 hover:opacity-100 cursor-default shrink-0'
                                        )}
                                    >
                                        <img
                                            src={tech.favicon ?? '/favicon.svg'}
                                            alt={tech.label}
                                            width={24}
                                            height={24}
                                            className='rounded-full size-8'
                                        />
                                        <span className="text-sm">{tech.label}</span>
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <div className="py-10">
                <EcosystemSpine />
            </div>

            <div className="container flex w-full flex-col items-center justify-center gap-4 py-10 sm:flex-row sm:gap-10">
                <Link
                    to="/showcase"
                    className="group inline-flex items-center gap-2 text-sm"
                >
                    <span className="decoration-wavy group-hover:underline">
                        {t.home.showcaseCta}
                    </span>
                    <span
                        aria-hidden
                        className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 motion-reduce:transition-none"
                    >
                        /
                    </span>
                </Link>
                <Link
                    to="/ecosystem"
                    className="group inline-flex items-center gap-2 text-sm"
                >
                    <span className="decoration-wavy group-hover:underline">
                        {t.home.moreCta}
                    </span>
                    <span
                        aria-hidden
                        className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 motion-reduce:transition-none"
                    >
                        /
                    </span>
                </Link>
            </div>
            <Closing />
        </article>
    )
}
