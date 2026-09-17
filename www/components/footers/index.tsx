import { m } from "@/paraglide/messages"
import { getFooterGroups } from "@components/footers/config"
import { cn } from "@infra/ui/lib/utils"
import { Link } from "@tanstack/react-router"
import { reveal } from "@lib/motion"
import { motion } from "motion/react"

export function Footer() {
    const groups = getFooterGroups()
    const year = new Date().getFullYear()

    return (
        <footer className="border-t border-border/35">
            <motion.section
                {...reveal}
                className="container flex flex-col items-center gap-8 py-10"
            >
                <div className="flex w-full max-w-3xl flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-1.5">
                        <picture>
                            <img
                                src="/favicon.svg"
                                alt="Pherus"
                                className="size-4 dark:hidden"
                                data-not-typeset
                            />
                            <img
                                src="/favicon_light.png"
                                alt="Pherus"
                                className="size-4 hidden dark:block"
                                data-not-typeset
                            />
                        </picture>
                        <span className="text-sm font-bold tracking-wider text-primary">
                            Pherus
                        </span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-10">
                        {groups.map((group) => (
                            <div
                                key={group.label}
                                className="flex flex-col items-center gap-2 sm:items-start"
                            >
                                <h2 className="text-sm font-semibold">
                                    {group.label}
                                </h2>
                                <nav className="flex flex-col items-center gap-1.5 sm:items-start">
                                    {group.links.map(
                                        (link) =>
                                            link.to ? (
                                                <Link
                                                    key={
                                                        link.label
                                                    }
                                                    to={
                                                        link.to
                                                    }
                                                    className="text-sm text-muted-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/60 w-fit"
                                                >
                                                    {
                                                        link.label
                                                    }
                                                </Link>
                                            ) : link.href ? (
                                                <a
                                                    key={
                                                        link.label
                                                    }
                                                    href={
                                                        link.href
                                                    }
                                                    className="text-sm text-muted-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/60 w-fit"
                                                >
                                                    {
                                                        link.label
                                                    }
                                                </a>
                                            ) : (
                                                <span
                                                    key={
                                                        link.label
                                                    }
                                                    className="text-sm text-muted-foreground/50 w-fit"
                                                >
                                                    {
                                                        link.label
                                                    }
                                                </span>
                                            )
                                    )}
                                </nav>
                            </div>
                        ))}
                    </div>
                </div>

                <p
                    className={cn(
                        "w-full max-w-3xl border-t border-border/20 pt-6 text-center",
                        "text-xs text-muted-foreground sm:text-left"
                    )}
                >
                    © {year} Pherus Inc.{" "}
                    {m["footer.copyright"]()}
                </p>
            </motion.section>
        </footer>
    )
}
