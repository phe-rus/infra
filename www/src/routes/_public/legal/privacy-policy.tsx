import { m } from "@/paraglide/messages"
import { cn } from "@infra/ui/lib/utils"
import { resolveLegalPage } from "@data/legal"
import { renderDoc } from "@data/lib/tiptap-doc"
import { reveal } from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/legal/privacy-policy"
)({
    head: () => {
        const page = resolveLegalPage("privacy-policy")

        return seo({
            title: page?.title ?? "Privacy policy",
            description: page?.description,
            path: page?.path ?? "/legal/privacy-policy",
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const page = resolveLegalPage("privacy-policy")

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

                <div
                    className={cn(
                        "mx-auto flex w-full md:max-w-3xl flex-col gap-5",
                        "[&_h2]:text-base [&_h2]:font-black",
                        "[&_h2:not(:first-child)]:mt-6",
                        "[&_p]:text-sm [&_p]:text-muted-foreground"
                    )}
                >
                    {page && renderDoc(page.content)}

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
