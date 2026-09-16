import { m } from "@/paraglide/messages"
import { cn } from "@infra/ui/lib/utils"
import { showcase } from "@data/showcase"
import {
    reveal,
    staggerContainer,
    staggerItem,
} from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { useMemo } from "react"

export const Route = createFileRoute("/_public/showcase/")({
    head: () =>
        seo({
            title: m[showcase.index.titleKey](),
            description: m[showcase.index.descriptionKey](),
            path: showcase.index.path,
        }),
    component: RouteComponent,
})

function RouteComponent() {
    const showcasing = useMemo(() => {
        return showcase.items.filter(
            (resource) => resource.descriptionKey
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
                        {m["showcase.hero.heading"]()}
                    </motion.h1>

                    <motion.p
                        {...reveal}
                        className="md:max-w-md text-base"
                    >
                        {m["showcase.hero.description"]()}
                    </motion.p>
                </div>

                <section className="container flex flex-col gap-5">
                    <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                        <motion.h3
                            {...reveal}
                            className="font-black"
                        >
                            {m["nav.showcase"]()}
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
                            <Link
                                key={item.slug}
                                to="/showcase/$slug"
                                params={{ slug: item.slug }}
                                className="contents"
                            >
                                <motion.article
                                    variants={staggerItem}
                                    whileTap={{ scale: 0.99 }}
                                    whileHover={{
                                        scale: 1.01,
                                    }}
                                    className={cn(
                                        "group flex flex-col overflow-hidden cursor-pointer",
                                        "break-inside-avoid! mb-5"
                                    )}
                                >
                                    <div className="mt-auto relative w-full aspect-video p-px">
                                        <div className="relative w-full h-full overflow-hidden rounded-none!">
                                            <img
                                                src={item.img}
                                                alt={
                                                    item.title
                                                }
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
                                            {item.descriptionKey &&
                                                m[
                                                    item
                                                        .descriptionKey
                                                ]()}
                                        </p>
                                    </div>
                                </motion.article>
                            </Link>
                        ))}
                    </motion.div>
                </section>
            </section>
        </article>
    )
}
