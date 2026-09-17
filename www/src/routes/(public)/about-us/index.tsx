import { m } from "@/paraglide/messages"
import {
    Grid02Icon,
    Mail01Icon,
    UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Avatar,
    AvatarFallback,
} from "@infra/ui/components/avatar"
import { cn } from "@infra/ui/lib/utils"
import { aboutUs } from "@data/about-us"
import { icons } from "@data/icons"
import { showcase } from "@data/showcase"
import {
    reveal,
    staggerContainer,
    staggerItem,
} from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute("/(public)/about-us/")({
    head: () =>
        seo({
            title: m[aboutUs.titleKey](),
            description: m[aboutUs.descriptionKey](),
            keywords: aboutUs.keywords,
            path: aboutUs.path,
        }),
    component: RouteComponent,
})

function initials(name: string) {
    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
}

function RouteComponent() {
    const building = showcase.items.filter(
        (resource) => resource.feed
    )

    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex min-h-[40dvh] flex-col justify-center">
                <div className="m-auto max-w-lg text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            delay: 0.3,
                            duration: 0.7,
                        }}
                        className="font-black"
                    >
                        {m[aboutUs.titleKey]()}
                    </motion.h1>

                    <motion.picture
                        {...reveal}
                        className="mx-auto my-5 block size-fit"
                    >
                        <img
                            src="/favicon.svg"
                            alt="Pherus"
                            className="size-20 dark:hidden"
                            data-not-typeset
                        />
                        <img
                            src="/favicon_light.png"
                            alt="Pherus"
                            className="hidden size-20 dark:block"
                            data-not-typeset
                        />
                    </motion.picture>

                    <motion.span
                        {...reveal}
                        className="mx-auto my-5 block h-18 w-px bg-primary/35"
                    />

                    <motion.p
                        {...reveal}
                        className="mx-auto max-w-md text-base"
                    >
                        {m[aboutUs.descriptionKey]()}
                    </motion.p>
                </div>
            </section>

            <section className="container flex flex-col gap-5">
                <motion.div
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-8 md:grid-cols-3"
                >
                    {aboutUs.sections.map((section) => (
                        <motion.div
                            key={section.headingKey}
                            variants={staggerItem}
                            className="flex flex-col gap-2"
                        >
                            <HugeiconsIcon
                                icon={icons[section.icon]}
                                className="size-6 text-primary"
                            />
                            <h2 className="text-base font-black">
                                {m[section.headingKey]()}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {m[section.bodyKey]()}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                <p className="mx-auto w-full max-w-3xl text-sm text-muted-foreground">
                    {m["legal.common.seeAlso"]()}{" "}
                    <Link
                        to="/licenses"
                        className="underline"
                    >
                        {m["nav.licenses.label"]()}
                    </Link>{" "}
                    {m["legal.common.and"]()}{" "}
                    <Link
                        to="/showcase"
                        className="underline"
                    >
                        {m["nav.showcase"]()}
                    </Link>
                    .
                </p>
            </section>

            <section
                className={cn(
                    "container flex min-h-[25dvh] w-full flex-col items-center",
                    "justify-center gap-5 text-center"
                )}
            >
                <HugeiconsIcon
                    icon={UserIcon}
                    className="size-8 text-primary"
                />

                <motion.h2 {...reveal} className="font-black">
                    {m["about.ownership.heading"]()}
                </motion.h2>

                <motion.p
                    {...reveal}
                    className="max-w-md text-sm text-muted-foreground"
                >
                    {m["about.ownership.body"]()}
                </motion.p>

                <motion.div
                    {...reveal}
                    className="flex flex-wrap items-center justify-center gap-6 pt-2"
                >
                    {aboutUs.people.map((person) => (
                        <div
                            key={person.name}
                            className="flex flex-col items-center gap-1"
                        >
                            <Avatar className="size-14">
                                <AvatarFallback>
                                    {initials(person.name)}
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-bold">
                                {person.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {m[person.roleKey]()}
                                {person.legalName &&
                                    ` · ${person.legalName}`}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </section>

            <section
                className={cn(
                    "container flex min-h-[25dvh] w-full flex-col items-center",
                    "justify-center gap-5 text-center"
                )}
            >
                <HugeiconsIcon
                    icon={Grid02Icon}
                    className="size-8 text-primary"
                />

                <motion.h2 {...reveal} className="font-black">
                    {m["about.ecosystem.heading"]()}
                </motion.h2>

                <motion.p
                    {...reveal}
                    className="max-w-md text-sm text-muted-foreground"
                >
                    {m["about.ecosystem.body"]()}
                </motion.p>

                <motion.div
                    {...reveal}
                    className="flex max-w-2xl flex-wrap items-center justify-center gap-2 pt-2"
                >
                    {showcase.items.map((item) => (
                        <Link
                            key={item.slug}
                            to="/showcase/$slug"
                            params={{ slug: item.slug }}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full border border-border/35",
                                "px-3 py-1 text-xs transition-colors hover:border-primary/50"
                            )}
                        >
                            <img
                                src={item.img}
                                alt={item.title}
                                className="size-3.5"
                                data-not-typeset
                            />
                            {item.title}
                        </Link>
                    ))}
                </motion.div>
            </section>

            <section
                className={cn(
                    "container flex min-h-[35dvh] w-full flex-col items-center",
                    "justify-center gap-5"
                )}
            >
                <motion.h2
                    {...reveal}
                    className="mx-auto text-center font-black"
                >
                    {m["about.building.heading"]()}
                </motion.h2>

                <div
                    className="relative w-full max-w-3xl select-none overflow-hidden"
                    style={{
                        maskImage:
                            "linear-gradient(90deg, #0000, #000 10% 90%, #0000)",
                    }}
                >
                    <div className="flex w-max animate-[marquee_20s_linear_infinite]">
                        {[...building, ...building].map(
                            ({ slug, title, feed }, i) => (
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
                            )
                        )}
                    </div>
                </div>
            </section>

            <section
                className={cn(
                    "container flex min-h-[30dvh] w-full flex-col items-center",
                    "justify-center gap-3 text-center"
                )}
            >
                <HugeiconsIcon
                    icon={Mail01Icon}
                    className="size-8 text-primary"
                />

                <motion.h2 {...reveal} className="font-black">
                    {m["about.contact.heading"]()}
                </motion.h2>

                <motion.p
                    {...reveal}
                    className="max-w-md text-sm text-muted-foreground"
                >
                    {m["about.contact.lead"]()}{" "}
                    <a
                        href={`mailto:${aboutUs.contactEmail}`}
                        className="underline"
                    >
                        {aboutUs.contactEmail}
                    </a>
                    .
                </motion.p>

                <motion.p
                    {...reveal}
                    className="text-sm text-muted-foreground"
                >
                    <a
                        href={`tel:${aboutUs.contactPhone.replace(/\s/g, "")}`}
                        className="underline"
                    >
                        {aboutUs.contactPhone}
                    </a>
                </motion.p>
            </section>
        </article>
    )
}
