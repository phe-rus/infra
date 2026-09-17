import { m } from "@/paraglide/messages"
import { resolveLegalPage } from "@data/legal"
import { renderDoc } from "@data/lib/tiptap-doc"
import { reveal } from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/(public)/legal/terms-of-service"
)({
    head: () => {
        const page = resolveLegalPage("terms-of-service")

        return seo({
            title: page?.title ?? "Terms of service",
            description: page?.description,
            path: page?.path ?? "/legal/terms-of-service",
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const page = resolveLegalPage("terms-of-service")

    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    <motion.h1
                        {...reveal}
                        className="font-black"
                    >
                        {page?.title}
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
                    {page && renderDoc(page.content)}

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
