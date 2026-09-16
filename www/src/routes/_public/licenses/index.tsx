import { m } from "@/paraglide/messages"
import { cn } from "@infra/ui/lib/utils"
import { reveal } from "@lib/motion"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute("/_public/licenses/")({
    component: RouteComponent,
})

function RouteComponent() {
    const tickHeights = ["h-4", "h-6", "h-3", "h-5"]

    const licenses = [
        {
            label: m["nav.licenses.pherus-license"](),
            to: "/licenses/pherus-license",
        },
        {
            label: m["nav.licenses.mit-license"](),
            to: "/licenses/mit-license",
        },
        {
            label: m["nav.licenses.apache-2.0-license"](),
            to: "/licenses/apache-2.0-license",
        },
        {
            label: m["nav.licenses.gpl-3.0-license"](),
            to: "/licenses/gpl-3.0-license",
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
                        {m["nav.licenses.label"]()}
                    </motion.h1>

                    <motion.p
                        {...reveal}
                        className="text-sm text-muted-foreground"
                    >
                        {m["licenses.index.intro"]()}
                    </motion.p>
                </div>

                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    {licenses.map((license, i) => (
                        <Link
                            key={license.to}
                            to={license.to}
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
                                {license.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </article>
    )
}
