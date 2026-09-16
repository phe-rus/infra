import { m } from "@/paraglide/messages"
import {
    IdeaIcon,
    Location01Icon,
    Mail01Icon,
    RouteIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@infra/ui/lib/utils"
import { resources } from "@lib/config"
import {
    reveal,
    staggerContainer,
    staggerItem,
} from "@lib/motion"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute("/_public/about-us/")({
    component: RouteComponent,
})

function RouteComponent() {
    const building = resources.filter(
        (resource) => resource.feed
    )

    const sections = [
        {
            icon: IdeaIcon,
            heading: m["about.whatWeDo.heading"](),
            body: m["about.whatWeDo.body"](),
        },
        {
            icon: Location01Icon,
            heading: m["about.whereBased.heading"](),
            body: m["about.whereBased.body"](),
        },
        {
            icon: RouteIcon,
            heading: m["about.howWeWork.heading"](),
            body: m["about.howWeWork.body"](),
        },
    ]

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
                        {m["nav.about-us"]()}
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
                        {m["about.description"]()}
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
                    {sections.map((section) => (
                        <motion.div
                            key={section.heading}
                            variants={staggerItem}
                            className="flex flex-col gap-2"
                        >
                            <HugeiconsIcon
                                icon={section.icon}
                                className="size-6 text-primary"
                            />
                            <h2 className="text-base font-black">
                                {section.heading}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {section.body}
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
                    </Link>
                    .
                </p>
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
                        href="mailto:pherus@pherus.org"
                        className="underline"
                    >
                        pherus@pherus.org
                    </a>
                    .
                </motion.p>
            </section>
        </article>
    )
}
