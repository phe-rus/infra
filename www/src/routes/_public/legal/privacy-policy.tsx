import { m } from "@/paraglide/messages"
import { reveal } from "@lib/motion"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/legal/privacy-policy"
)({
    component: RouteComponent,
})

function RouteComponent() {
    const sections = [
        {
            heading: m["legal.privacy.overview.heading"](),
            body: m["legal.privacy.overview.body"](),
        },
        {
            heading: m["legal.privacy.thisSite.heading"](),
            body: m["legal.privacy.thisSite.body"](),
        },
        {
            heading: m["legal.privacy.accounts.heading"](),
            body: m["legal.privacy.accounts.body"](),
        },
        {
            heading: m["legal.privacy.usage.heading"](),
            body: m["legal.privacy.usage.body"](),
        },
        {
            heading: m["legal.privacy.cookies.heading"](),
            body: m["legal.privacy.cookies.body"](),
        },
        {
            heading: m["legal.privacy.storage.heading"](),
            body: m["legal.privacy.storage.body"](),
        },
        {
            heading: m["legal.privacy.retention.heading"](),
            body: m["legal.privacy.retention.body"](),
        },
        {
            heading: m["legal.privacy.rights.heading"](),
            body: m["legal.privacy.rights.body"](),
        },
        {
            heading: m["legal.privacy.children.heading"](),
            body: m["legal.privacy.children.body"](),
        },
        {
            heading: m["legal.privacy.changes.heading"](),
            body: m["legal.privacy.changes.body"](),
        },
        {
            heading: m["legal.privacy.contact.heading"](),
            body: m["legal.privacy.contact.body"](),
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
                        {m["nav.legal.privacy-policy"]()}
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
                            to="/legal/terms-of-service"
                            className="underline"
                        >
                            {m[
                                "nav.legal.terms-of-service"
                            ]()}
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
