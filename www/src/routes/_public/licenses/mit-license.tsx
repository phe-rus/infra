import { m } from "@/paraglide/messages"
import { resolveLicense } from "@data/licenses"
import { renderDoc } from "@data/lib/tiptap-doc"
import { reveal } from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/licenses/mit-license"
)({
    head: () => {
        const license = resolveLicense("mit-license")

        return seo({
            title: license?.label ?? "MIT license",
            description: license?.description,
            path: license?.path ?? "/licenses/mit-license",
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const license = resolveLicense("mit-license")

    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    <motion.h1
                        {...reveal}
                        className="font-black"
                    >
                        {license?.label}
                    </motion.h1>

                    <motion.p
                        {...reveal}
                        className="text-sm text-muted-foreground"
                    >
                        {m["legal.common.lastUpdated"]()}:{" "}
                        {license?.lastUpdated}
                    </motion.p>

                    <motion.p
                        {...reveal}
                        className="text-sm text-muted-foreground"
                    >
                        {license?.disclaimer}
                    </motion.p>
                </div>

                <div
                    data-not-typeset
                    className="mx-auto w-full md:max-w-3xl [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:font-sans [&_pre]:text-sm [&_pre]:leading-relaxed"
                >
                    {license && renderDoc(license.content)}
                </div>
            </section>
        </article>
    )
}
