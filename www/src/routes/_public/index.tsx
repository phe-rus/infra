import { m } from "@/paraglide/messages"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@infra/ui/components/tabs"
import { cn } from "@infra/ui/lib/utils"
import { home } from "@data/home"
import { icons } from "@data/icons"
import {
    resourcesByHomeCategory,
    showcase,
} from "@data/showcase"
import {
    reveal,
    staggerContainer,
    staggerItem,
} from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute("/_public/")({
    head: () =>
        seo({
            title: home.title,
            description: m[home.descriptionKey](),
            path: home.path,
        }),
    component: RouteComponent,
})

function RouteComponent() {
    const contribution = showcase.items.filter(
        (resource) => resource.feed
    )

    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex min-h-[55dvh] flex-col justify-center">
                <div className="m-auto max-w-lg text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            delay: 0.3,
                            duration: 0.7,
                        }}
                        className="text-5xl font-black md:text-8xl"
                    >
                        {home.title}
                    </motion.h1>

                    <motion.picture
                        {...reveal}
                        className="mx-auto my-5 block size-fit"
                    >
                        <img
                            src="/favicon.svg"
                            alt="Pherus"
                            className="size-32 dark:hidden"
                            data-not-typeset
                        />
                        <img
                            src="/favicon_light.png"
                            alt="Pherus"
                            className="hidden size-32 dark:block"
                            data-not-typeset
                        />
                    </motion.picture>

                    <motion.h2
                        {...reveal}
                        className="font-black"
                    >
                        {m["overview.hero.heading"]()}{" "}
                        <span className="text-muted-foreground">
                            {m["overview.hero.tagline"]()}
                        </span>
                    </motion.h2>

                    <motion.p
                        {...reveal}
                        className="text-base"
                    >
                        {m[home.descriptionKey]()}
                    </motion.p>

                    <motion.span
                        {...reveal}
                        className="mx-auto my-10 block h-18 w-px bg-primary/35"
                    />
                </div>
            </section>

            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    <motion.h2
                        {...reveal}
                        className="font-black"
                    >
                        {m["overview.fields.heading"]()}
                    </motion.h2>

                    <motion.p
                        {...reveal}
                        className="md:max-w-md text-base"
                    >
                        {m["overview.fields.description"]()}
                    </motion.p>
                </div>

                <motion.div
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="mx-auto flex w-full md:max-w-3xl flex-wrap gap-2"
                >
                    {home.fields.map((field) => (
                        <motion.div
                            key={field.titleKey}
                            variants={staggerItem}
                            className={cn(
                                "group cursor-pointer rounded-md border p-1",
                                "bg-muted text-muted-foreground shadow",
                                "hover:shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={icons[field.icon]}
                                    className="size-5"
                                />
                                <p className="text-xs! font-semibold">
                                    {m[field.titleKey]()}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <section
                className={cn(
                    "container flex min-h-[50dvh] w-full flex-col items-center",
                    "justify-center gap-5"
                )}
            >
                <motion.h2
                    {...reveal}
                    className="mx-auto text-center font-black md:max-w-md"
                >
                    {m["overview.marquee.heading"]()}
                </motion.h2>

                <div
                    className="relative w-full max-w-3xl select-none overflow-hidden"
                    style={{
                        maskImage:
                            "linear-gradient(90deg, #0000, #000 10% 90%, #0000)",
                    }}
                >
                    <div className="flex w-max animate-[marquee_20s_linear_infinite]">
                        {[
                            ...contribution,
                            ...contribution,
                        ].map(({ slug, title, feed }, i) => (
                            <a
                                key={`${slug}-${i}`}
                                href={feed}
                                className={cn(
                                    "flex shrink-0 items-center gap-2 pr-12",
                                    "cursor-default opacity-80 transition-opacity",
                                    "hover:opacity-100"
                                )}
                            >
                                <img
                                    src="/favicon.svg"
                                    alt={title}
                                    className="size-6 rounded-full"
                                    data-not-typeset
                                />
                                <span className="text-base">
                                    {title}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    <motion.h2
                        {...reveal}
                        className="text-center font-black"
                    >
                        {m["overview.showcase.heading"]()}
                    </motion.h2>
                </div>

                <div className="flex flex-col md:max-w-3xl w-full mx-auto">
                    <Tabs
                        defaultValue={
                            home.showcaseTabs[0].category
                        }
                        className="flex flex-col gap-5 w-full"
                    >
                        <TabsList
                            variant="line"
                            className="mx-auto gap-5"
                        >
                            {home.showcaseTabs.map(
                                ({ category, titleKey }) => (
                                    <TabsTrigger
                                        key={category}
                                        value={category}
                                        className="p-0 text-sm"
                                    >
                                        {m[titleKey]()}
                                    </TabsTrigger>
                                )
                            )}
                        </TabsList>

                        {home.showcaseTabs.map(
                            ({ category }) => (
                                <TabsContent
                                    key={category}
                                    value={category}
                                    className="w-full gap-5"
                                >
                                    <motion.div
                                        initial="initial"
                                        whileInView="whileInView"
                                        viewport={{
                                            once: true,
                                        }}
                                        variants={
                                            staggerContainer
                                        }
                                        className="columns-1 md:columns-2 lg:columns-3 gap-2 w-full"
                                    >
                                        {resourcesByHomeCategory(
                                            category
                                        ).map((resource) => (
                                            <Link
                                                key={
                                                    resource.slug
                                                }
                                                to="/showcase/$slug"
                                                params={{
                                                    slug: resource.slug,
                                                }}
                                                className="contents"
                                            >
                                                <motion.article
                                                    variants={
                                                        staggerItem
                                                    }
                                                    whileTap={{
                                                        scale: 0.99,
                                                    }}
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
                                                                src={
                                                                    resource.img
                                                                }
                                                                alt={
                                                                    resource.title
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
                                                        <h1 className="text-base!">
                                                            {
                                                                resource.title
                                                            }
                                                        </h1>
                                                        <p className="text-sm!">
                                                            {resource.descriptionKey &&
                                                                m[
                                                                    resource
                                                                        .descriptionKey
                                                                ]()}
                                                        </p>
                                                    </div>
                                                </motion.article>
                                            </Link>
                                        ))}
                                    </motion.div>
                                </TabsContent>
                            )
                        )}
                    </Tabs>
                </div>
            </section>
        </article>
    )
}
