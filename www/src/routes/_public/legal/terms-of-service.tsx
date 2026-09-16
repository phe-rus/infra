import { m } from "@/paraglide/messages"
import { reveal } from "@lib/motion"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/legal/terms-of-service"
)({
    component: RouteComponent,
})

function RouteComponent() {
    const sections = [
        {
            heading: m["legal.tos.acceptance.heading"](),
            body: m["legal.tos.acceptance.body"](),
        },
        {
            heading: m["legal.tos.services.heading"](),
            body: m["legal.tos.services.body"](),
        },
        {
            heading: m["legal.tos.accounts.heading"](),
            body: m["legal.tos.accounts.body"](),
        },
        {
            heading: m["legal.tos.acceptableUse.heading"](),
            body: m["legal.tos.acceptableUse.body"](),
        },
        {
            heading: m["legal.tos.ip.heading"](),
            body: m["legal.tos.ip.body"](),
        },
        {
            heading: m["legal.tos.thirdParty.heading"](),
            body: m["legal.tos.thirdParty.body"](),
        },
        {
            heading: m["legal.tos.disclaimer.heading"](),
            body: m["legal.tos.disclaimer.body"](),
        },
        {
            heading: m["legal.tos.liability.heading"](),
            body: m["legal.tos.liability.body"](),
        },
        {
            heading: m["legal.tos.governingLaw.heading"](),
            body: m["legal.tos.governingLaw.body"](),
        },
        {
            heading: m["legal.tos.changes.heading"](),
            body: m["legal.tos.changes.body"](),
        },
        {
            heading: m["legal.tos.contact.heading"](),
            body: m["legal.tos.contact.body"](),
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
                        {m["nav.legal.terms-of-service"]()}
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
                            <p className="text-sm text-muted-foreground">
                                {section.body}
                            </p>
                        </div>
                    ))}

                    <p className="text-sm text-muted-foreground">
                        {m["legal.common.seeAlso"]()}{" "}
                        <Link
                            to="/legal/privacy-policy"
                            className="underline"
                        >
                            {m["nav.legal.privacy-policy"]()}
                        </Link>{" "}
                        {m["legal.common.and"]()}{" "}
                        <Link
                            to="/legal/cookie-policy"
                            className="underline"
                        >
                            {m["nav.legal.cookie-policy"]()}
                        </Link>
                        .
                    </p>
                </div>
            </section>
        </article>
    )
}
