import { m } from "@/paraglide/messages"
import { reveal } from "@lib/motion"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/legal/legal-notice"
)({
    component: RouteComponent,
})

function RouteComponent() {
    const sections = [
        {
            heading: "Operator",
            body: "Pherus Inc.\n[registered address]",
        },
        {
            heading: "Contact",
            body: "[contact email]",
        },
        {
            heading: "Registration",
            body: "[company registration number, if applicable]",
        },
        {
            heading: "Responsible for content",
            body: "[name of person or role responsible for this site's content]",
        },
        {
            heading: "Disclaimer",
            body: "We link to external sites for convenience and take reasonable care in selecting them, but we aren't responsible for their content once you leave pherus.org.",
        },
        {
            heading: "Governing law",
            body: "This notice is governed by the laws of [jurisdiction].",
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
                        Last updated: 2026-09-16
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
