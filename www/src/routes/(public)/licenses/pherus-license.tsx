import { m } from "@/paraglide/messages"
import { resolveLicense } from "@data/licenses"
import { DocPreview } from "@data/lib/tiptap-doc"
import { reveal } from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/(public)/licenses/pherus-license"
)({
    head: () => {
        const license = resolveLicense("pherus-license")

        return seo({
            title: license?.label ?? "Pherus license",
            description: license?.description,
            keywords: license?.keywords,
            path: license?.path ?? "/licenses/pherus-license",
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const license = resolveLicense("pherus-license")

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
                        className="md:max-w-md text-base"
                    >
                        {license?.description}
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
