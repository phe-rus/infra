import { m } from "@/paraglide/messages"
import {
    HeartHandshakeIcon,
    LegalIcon,
    RainbowIcon,
    Science,
    SecurityIcon,
    SoftwareIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@infra/ui/components/tabs"
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

export const Route = createFileRoute("/_public/")({
    component: RouteComponent,
})

function RouteComponent() {
    const contribution = useMemo(() => {
        return resources.filter((resource) => resource.feed)
    }, [])

    const fieldList = [
        {
            title: m["overview.fields.identity.title"](),
            icon: SecurityIcon,
            items: [
                "Pherus Pass",
                "Pherus Account",
                "Authentication",
            ],
            description:
                m["overview.fields.identity.description"](),
        },
        {
            title: m["overview.fields.health.title"](),
            icon: HeartHandshakeIcon,
            items: [
                "Pherus Health",
                "Health research",
                "Care infrastructure",
            ],
            description:
                m["overview.fields.health.description"](),
        },
        {
            title: m["overview.fields.justice.title"](),
            icon: LegalIcon,
            items: [
                "Pleadli",
                "Legal technology",
                "Civic systems",
            ],
            description:
                m["overview.fields.justice.description"](),
        },
        {
            title: m["overview.fields.queer.title"](),
            icon: RainbowIcon,
            items: [
                "Pherus Transspace",
                "Q2Q network",
                "Community resources",
            ],
            description:
                m["overview.fields.queer.description"](),
        },
        {
            title: m["overview.fields.science.title"](),
            icon: Science,
            items: [
                "Research",
                "Experiments",
                "Scientific projects",
            ],
            description:
                m["overview.fields.science.description"](),
        },
        {
            title: m["overview.fields.software.title"](),
            icon: SoftwareIcon,
            items: [
                "Open source",
                "Developer tools",
                "Pherus infrastructure",
            ],
            description:
                m["overview.fields.software.description"](),
        },
    ]

    const showcasing = [
        {
            tab: m["overview.showcase.tabs.projects"](),
            items: [
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
            ],
        },
        {
            tab: m["overview.showcase.tabs.research"](),
            items: [
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
            ],
        },
        {
            tab: m["overview.showcase.tabs.redesign"](),
            items: [
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
            ],
        },
    ]

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
                        Pherus
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
                        {m["overview.hero.description"]()}
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
                    {fieldList.map(({ title, icon }) => (
                        <motion.div
                            key={title}
                            variants={staggerItem}
                            className={cn(
                                "group cursor-pointer rounded-md border p-1",
                                "bg-muted text-muted-foreground shadow",
                                "hover:shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={icon}
                                    className="size-5"
                                />
                                <p className="text-xs! font-semibold">
                                    {title}
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
                        defaultValue={showcasing[0].tab}
                        className="flex flex-col gap-5 w-full"
                    >
                        <TabsList
                            variant="line"
                            className="mx-auto gap-5"
                        >
                            {showcasing?.map(({ tab }, i) => (
                                <TabsTrigger
                                    key={i}
                                    value={tab}
                                    className="p-0 text-sm"
                                >
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {showcasing?.map(
                            ({ items, tab }, i) => (
                                <TabsContent
                                    key={i}
                                    value={tab}
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
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full"
                                    >
                                        {items?.map(
                                            (item, i) => (
                                                <motion.a
                                                    variants={
                                                        staggerItem
                                                    }
                                                    whileTap={{
                                                        scale: 0.99,
                                                    }}
                                                    whileHover={{
                                                        scale: 1.01,
                                                    }}
                                                    key={i}
                                                    href={
                                                        item.to
                                                    }
                                                    className={cn(
                                                        "group bg-muted overflow-hidden",
                                                        "rounded-sm border cursor-pointer shadow",
                                                        "hover:-translate-y-1 transition-all duration-500",
                                                        "hover:shadow-sm"
                                                    )}
                                                >
                                                    <div className="flex flex-col text-center w-full p-5">
                                                        <h1 className="text-base!">
                                                            {
                                                                item.title
                                                            }
                                                        </h1>
                                                        <p>
                                                            {
                                                                item.description
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="mt-auto relative w-full aspect-video p-px">
                                                        <div className="relative w-full h-full overflow-hidden rounded-sm">
                                                            <img
                                                                src={
                                                                    item.img
                                                                }
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
                                                </motion.a>
                                            )
                                        )}
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
