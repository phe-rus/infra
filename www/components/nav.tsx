import { getDictionary } from "@/lib/i18n"
import {
    getLocale,
    locales,
    setLocale,
} from "@/src/paraglide/runtime"
import { cn } from "@infra/ui/lib/utils"
import { Link, useLocation } from "@tanstack/react-router"
import { useMemo } from "react"

const LOCALE_LABEL: Record<string, string> = {
    en: "EN",
    zh: "中文",
    fr: "FR",
}

export function Nav() {
    const location = useLocation()
    const t = getDictionary()
    const active = getLocale()

    const navItems = useMemo(
        () =>
            (["ecosystem", "showcase", "about"] as const).map(
                (key) => ({
                    name: t.nav[key],
                    to: `/${key}`,
                })
            ),
        [t]
    )

    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
            <div className="container flex items-center justify-between gap-3 py-6 text-sm md:py-10">
                <Link
                    to="/"
                    className="shrink-0 font-medium tracking-tight"
                >
                    Pherus
                </Link>
                <nav className="flex min-w-0 items-center gap-3 text-muted-foreground sm:gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={cn(
                                "transition-colors hover:text-foreground",
                                location.pathname.startsWith(
                                    item.to
                                ) && "text-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="flex items-center gap-2">
                        {locales.map((locale, idx) => (
                            <span
                                key={locale}
                                className="flex items-center gap-2"
                            >
                                {idx > 0 && (
                                    <span
                                        aria-hidden
                                        className="text-border"
                                    >
                                        /
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLocale(locale)
                                    }
                                    aria-label={t.nav.locale}
                                    aria-current={
                                        locale === active
                                    }
                                    className={cn(
                                        "transition-colors hover:text-foreground",
                                        locale === active &&
                                            "text-foreground"
                                    )}
                                >
                                    {LOCALE_LABEL[locale] ??
                                        locale}
                                </button>
                            </span>
                        ))}
                    </div>
                </nav>
            </div>
        </header>
    )
}
