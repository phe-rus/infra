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
            name: "PARAGLIDE_LOCALE",
            purpose:
                "Remembers your selected language (English, 中文, or Français) between visits.",
            duration: "1 year",
        },
        {
            name: "theme (local storage, not a cookie)",
            purpose:
                "Remembers whether you're using light or dark mode.",
            duration: "Until cleared by you",
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
                        Last updated: 2026-09-16
                    </motion.p>
                </div>

                <div className="mx-auto flex w-full md:max-w-3xl flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-base font-black">
                            What we use on pherus.org
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            pherus.org sets exactly one cookie
                            and one local storage entry,
                            listed below. We don't use
                            advertising cookies, analytics
                            trackers, or any third-party
                            tracking scripts on this site.
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
                                    Duration:{" "}
                                    {cookie.duration}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-1">
                        <h2 className="text-base font-black">
                            Signed-in sessions
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            If you sign in to a Pherus account
                            at account.pherus.org, that
                            subdomain sets its own session
                            cookie to keep you signed in. You
                            can review and revoke your active
                            sessions at any time from your
                            account's security settings.
                        </p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h2 className="text-base font-black">
                            Managing cookies
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Most browsers let you block or
                            delete cookies in their settings.
                            Blocking the locale cookie just
                            means we can't remember your
                            language choice between visits —
                            nothing else on this site depends
                            on it.
                        </p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h2 className="text-base font-black">
                            Changes to this policy
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            If what we store ever changes,
                            we'll update this page and the
                            date above.
                        </p>
                    </div>
                </div>
            </section>
        </article>
    )
}
