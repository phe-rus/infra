import { m } from "@/paraglide/messages"
import { resolveLegalPage } from "@data/legal"
import { DocPreview } from "@data/lib/tiptap-doc"
import { reveal } from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/(public)/legal/legal-notice"
)({
    head: () => {
        const page = resolveLegalPage("legal-notice")

        return seo({
            title: page?.title ?? "Legal notice",
            description: page?.description,
            keywords: page?.keywords,
            path: page?.path ?? "/legal/legal-notice",
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const page = resolveLegalPage("legal-notice")

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
                    {page && (
                        <DocPreview doc={page.content} />
                    )}
                </div>
            </section>
        </article>
    )
}
