import { getDictionary } from "@/lib/i18n"
import { Link } from "@tanstack/react-router"

export function Closing() {
    const t = getDictionary()
    const year = new Date().getFullYear()

    return (
        <footer className="container flex flex-col gap-4 py-24 text-sm text-muted-foreground">
            <p className="max-w-md text-balance">
                {t.footer.statement}
            </p>
            <div className="flex items-center gap-6">
                <Link
                    to="/ecosystem"
                    className="hover:text-foreground"
                >
                    {t.nav.ecosystem}
                </Link>
                <Link
                    to="/about"
                    className="hover:text-foreground"
                >
                    {t.nav.about}
                </Link>
            </div>
            <span>&copy; {year} Pherus</span>
        </footer>
    )
}
