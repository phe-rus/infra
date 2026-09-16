import { cn } from "@infra/ui/lib/utils"
import { resolveLegalIndex } from "@data/legal"
import { reveal } from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute("/_public/legal/")({
    head: () => {
        const index = resolveLegalIndex()

        return seo({
            title: index.title,
            description: index.description,
            path: index.path,
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const tickHeights = ["h-4", "h-6", "h-3", "h-5"]
    const index = resolveLegalIndex()

    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    <motion.h1
                        {...reveal}
                        className="font-black"
                    >
                        {index.title}
                    </motion.h1>

                    <motion.p
                        {...reveal}
                        className="text-sm text-muted-foreground"
                    >
                        {index.description}
                    </motion.p>
                </div>

                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    {index.items.map((page, i) => (
                        <Link
                            key={page.slug}
                            to={page.path}
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
