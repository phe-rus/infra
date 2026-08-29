import { cn } from "@infra/ui/lib/utils"
import { Link } from "@tanstack/react-router"
import type { NavTriggerProps } from "../config"

export function NavTrigger({
    label,
    to,
    active,
    onMouseEnter,
}: NavTriggerProps) {
    return (
        <div className="relative" onMouseEnter={onMouseEnter}>
            <article
                className={cn(
                    "group flex flex-col items-center gap-1",
                    "select-none cursor-pointer transition-colors"
                )}
            >
                {to ? (
                    <Link
                        to={to}
                        className={cn(
                            "text-xs transition-colors",
                            active && "text-primary"
                        )}
                    >
                        {label}
                    </Link>
                ) : (
                    <span
                        className={cn(
                            "text-xs transition-colors",
                            active && "text-primary"
                        )}
                    >
                        {label}
                    </span>
                )}
                <span
                    className={cn(
                        "absolute -bottom-2.75 h-px w-full scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100",
                        active && "scale-x-100"
                    )}
                />
            </article>
        </div>
    )
}
