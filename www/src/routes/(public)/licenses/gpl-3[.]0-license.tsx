import { m } from "@/paraglide/messages"
import { resolveLicense } from "@data/licenses"
import { DocPreview } from "@data/lib/tiptap-doc"
import { reveal } from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/(public)/licenses/gpl-3.0-license"
)({
    head: () => {
        const license = resolveLicense("gpl-3.0-license")

        return seo({
            title: license?.label ?? "GPLv3 license",
            description: license?.description,
            path:
                license?.path ?? "/licenses/gpl-3.0-license",
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const license = resolveLicense("gpl-3.0-license")

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

                <div className="mx-auto w-full md:max-w-3xl">
                    {license && (
                        <DocPreview doc={license.content} />
                    )}
                </div>
            </section>
        </article>
    )
}
