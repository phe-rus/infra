import { cn } from "@infra/ui/lib/utils"
import { resources } from "@lib/config"
import {
    reveal,
    staggerContainer,
    staggerItem,
} from "@lib/motion"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { useMemo } from "react"

export const Route = createFileRoute("/_public/showcase/")({
    component: RouteComponent,
})

function RouteComponent() {
    const showcasing = useMemo(() => {
        return resources.filter(
            (resource) => resource.description
        )
    }, [])

    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    <motion.h1
                        {...reveal}
                        className="font-black"
                    >
                        A detailed overview into the work we
                        have accomplished or are currently
                        working on.
                    </motion.h1>

                    <motion.p
                        {...reveal}
                        className="md:max-w-md text-base"
                    >
                        The work we do at Pherus touches many
                        different fields, from identity and
                        access management to health and legal
                        technology.
                    </motion.p>
                </div>

                <section className="container flex flex-col gap-5">
                    <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                        <motion.h3
                            {...reveal}
                            className="font-black"
                        >
                            Showcase
                        </motion.h3>
                    </div>

                    <motion.div
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className={cn(
                            "columns-2 md:columns-3 gap-2 mx-auto w-full",
                            "md:max-w-3xl"
                        )}
                    >
                        {showcasing?.map((item) => (
                            <motion.article
                                variants={staggerItem}
                                whileTap={{ scale: 0.99 }}
                                whileHover={{ scale: 1.01 }}
                                key={item.slug}
                                className={cn(
                                    "group flex flex-col overflow-hidden cursor-pointer",
                                    "break-inside-avoid! mb-5"
                                )}
                            >
                                <div className="mt-auto relative w-full aspect-video p-px">
                                    <div className="relative w-full h-full overflow-hidden rounded-none!">
                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            className={cn(
                                                "absolute inset-0 w-full h-full object-cover",
                                                "group-hover:scale-101 transition-transform",
                                                "duration-700 ease-out transition-opacity",
                                                "duration-500 opacity-100"
                                            )}
                                            data-not-typeset
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col w-full py-1">
                                    <span className="text-xs! font-medium text-muted-foreground">
                                        {item.tags
                                            ?.map(
                                                (tag) =>
                                                    `#${tag}`
                                            )
                                            .join(", ")}
                                    </span>
                                    <span className="text-xs! font-medium text-muted-foreground">
                                        {item.stack
                                            ?.map(
                                                (tag) =>
                                                    `#${tag}`
                                            )
                                            .join(", ")}
                                    </span>
                                    <h1 className="text-base!">
                                        {item.title}
                                    </h1>
                                    <p className="text-sm!">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                </section>
            </section>
        </article>
    )
}
