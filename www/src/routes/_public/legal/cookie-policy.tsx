import { m } from "@/paraglide/messages"
import { cn } from "@infra/ui/lib/utils"
import { resolveCookiePolicy } from "@data/legal"
import { renderDoc } from "@data/lib/tiptap-doc"
import { reveal } from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/legal/cookie-policy"
)({
    head: () => {
        const page = resolveCookiePolicy()

        return seo({
            title: page.title,
            description: page.description,
            path: page.path,
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const page = resolveCookiePolicy()

    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    <motion.h1
                        {...reveal}
                        className="font-black"
                    >
                        {page.title}
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
                    <div
                        className={cn(
                            "[&_h2]:text-base [&_h2]:font-black",
                            "[&_p]:text-sm [&_p]:text-muted-foreground"
                        )}
                    >
                        {renderDoc(page.intro)}
                    </div>

                    <div className="flex flex-col gap-2">
                        {page.cookies.map((cookie) => (
                            <div
                                key={cookie.name}
                                className="rounded-md border bg-muted p-4"
                            >
                                <p className="font-mono text-sm font-semibold">
                                    {cookie.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {cookie.purpose}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {page.durationLabel}:{" "}
                                    {cookie.duration}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div
                        className={cn(
                            "flex flex-col gap-5",
                            "[&_h2]:text-base [&_h2]:font-black",
                            "[&_h2:not(:first-child)]:mt-6",
                            "[&_p]:text-sm [&_p]:text-muted-foreground"
                        )}
                    >
                        {renderDoc(page.sections)}
                    </div>
                </div>
            </section>
        </article>
    )
}
