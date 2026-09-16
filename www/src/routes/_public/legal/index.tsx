import { m } from "@/paraglide/messages"
import { cn } from "@infra/ui/lib/utils"
import { reveal } from "@lib/motion"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute("/_public/legal/")({
    component: RouteComponent,
})

function RouteComponent() {
    const tickHeights = ["h-4", "h-6", "h-3", "h-5"]

    const pages = [
        {
            label: m["nav.legal.terms-of-service"](),
            to: "/legal/terms-of-service",
        },
        {
            label: m["nav.legal.privacy-policy"](),
            to: "/legal/privacy-policy",
        },
        {
            label: m["nav.legal.cookie-policy"](),
            to: "/legal/cookie-policy",
        },
        {
            label: m["nav.legal.legal-notice"](),
            to: "/legal/legal-notice",
        },
    ]

    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    <motion.h1
                        {...reveal}
                        className="font-black"
                    >
                        {m["nav.legal.label"]()}
                    </motion.h1>
                </div>

                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    {pages.map((page, i) => (
                        <Link
                            key={page.to}
                            to={page.to}
                            className="group flex items-center gap-3 py-2"
                        >
                            <span
                                className={cn(
                                    "w-px bg-primary/40 transition-colors duration-300",
                                    "group-hover:bg-primary",
                                    tickHeights[
                                        i % tickHeights.length
                                    ]
                                )}
                            />
                            <span className="text-base font-semibold">
                                {page.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </article>
    )
}
