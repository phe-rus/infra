import { m } from "@/paraglide/messages"
import { reveal } from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/legal/legal-notice"
)({
    head: () =>
        seo({
            title: m["nav.legal.legal-notice"](),
            description: m["legal.notice.metaDescription"](),
            path: "/legal/legal-notice",
        }),
    component: RouteComponent,
})

function RouteComponent() {
    const sections = [
        {
            heading: m["legal.notice.operator.heading"](),
            body: m["legal.notice.operator.body"](),
        },
        {
            heading: m["legal.notice.contact.heading"](),
            body: m["legal.notice.contact.body"](),
        },
        {
            heading: m["legal.notice.responsible.heading"](),
            body: m["legal.notice.responsible.body"](),
        },
        {
            heading: m["legal.notice.disclaimer.heading"](),
            body: m["legal.notice.disclaimer.body"](),
        },
        {
            heading: m["legal.notice.governingLaw.heading"](),
            body: m["legal.notice.governingLaw.body"](),
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
                        {m["nav.legal.legal-notice"]()}
                    </motion.h1>

                    <motion.p
                        {...reveal}
                        className="text-sm text-muted-foreground"
                    >
                        {m["legal.common.lastUpdated"]()}:
                        2026-09-16
                    </motion.p>
                </div>

                <div className="mx-auto flex w-full md:max-w-3xl flex-col gap-5">
                    {sections.map((section) => (
                        <div
                            key={section.heading}
                            className="flex flex-col gap-1"
                        >
                            <h2 className="text-base font-black">
                                {section.heading}
                            </h2>
                            <p className="whitespace-pre-line text-sm text-muted-foreground">
                                {section.body}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </article>
    )
}
