import { m } from "@/paraglide/messages"
import { reveal } from "@lib/motion"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/legal/cookie-policy"
)({
    component: RouteComponent,
})

function RouteComponent() {
    const cookies = [
        {
            name: m["legal.cookies.localeCookie.name"](),
            purpose:
                m["legal.cookies.localeCookie.purpose"](),
            duration:
                m["legal.cookies.localeCookie.duration"](),
        },
        {
            name: m["legal.cookies.themeStorage.name"](),
            purpose:
                m["legal.cookies.themeStorage.purpose"](),
            duration:
                m["legal.cookies.themeStorage.duration"](),
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
                        {m["nav.legal.cookie-policy"]()}
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
                    <div className="flex flex-col gap-1">
                        <h2 className="text-base font-black">
                            {m[
                                "legal.cookies.intro.heading"
                            ]()}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {m["legal.cookies.intro.body"]()}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        {cookies.map((cookie) => (
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
                                    {m[
                                        "legal.cookies.durationLabel"
                                    ]()}
                                    : {cookie.duration}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-1">
                        <h2 className="text-base font-black">
                            {m[
                                "legal.cookies.sessions.heading"
                            ]()}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {m[
                                "legal.cookies.sessions.body"
                            ]()}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h2 className="text-base font-black">
                            {m[
                                "legal.cookies.managing.heading"
                            ]()}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {m[
                                "legal.cookies.managing.body"
                            ]()}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h2 className="text-base font-black">
                            {m[
                                "legal.cookies.changes.heading"
                            ]()}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {m[
                                "legal.cookies.changes.body"
                            ]()}
                        </p>
                    </div>
                </div>
            </section>
        </article>
    )
}
