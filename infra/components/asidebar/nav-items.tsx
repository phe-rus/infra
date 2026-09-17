import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import { ChevronDownIcon } from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"
import { Fragment } from "react"
import { cn } from "@infra/ui/lib/utils"

export type NavLeaf = {
    label: string
    path: string
    Icon: IconSvgElement
    isDev?: boolean
}

export type NavGroup = {
    label: string
    items: NavLeaf[]
}

export type NavEntry = NavLeaf | NavGroup

const linkClassName = cn(
    "group tracking-tight flex items-center gap-2",
    "border-l-2 border-transparent pl-2 relative font-light!",
    "transition-colors duration-150 ease-out"
)
const inertClassName = cn(
    "group tracking-tight flex items-center gap-2",
    "border-l-2 border-transparent pl-2 relative font-light!",
    "cursor-not-allowed opacity-60"
)
const activeClassName =
    "border-primary text-primary font-normal!"

function ComingSoonBadge() {
    return (
        <span
            className={cn(
                "absolute -top-0.5 right-3 text-[5px] bg-destructive/45",
                "text-destructive-foreground rounded-2xl px-1 py-0.5"
            )}
        >
            coming soon
        </span>
    )
}

/** A single nav row: a real Link once built, an inert row (no navigation, "coming soon" badge) while it isn't. `compact` shrinks the icon for a nested group item. */
export function NavLink({
    label,
    path,
    Icon,
    isDev,
    compact,
}: NavLeaf & { compact?: boolean }) {
    const iconClassName = compact ? "size-4.5" : "size-5"

    if (isDev) {
        return (
            <div
                aria-disabled="true"
                className={inertClassName}
            >
                <HugeiconsIcon
                    icon={Icon}
                    className={iconClassName}
                />
                {label}
                <ComingSoonBadge />
            </div>
        )
    }

    return (
        <Link
            to={path}
            className={linkClassName}
            activeProps={{ className: activeClassName }}
        >
            <HugeiconsIcon
                icon={Icon}
                className={iconClassName}
            />
            {label}
        </Link>
    )
}

/** A collapsible nav group: a toggle header, then its NavLinks when expanded. */
export function NavGroupSection({
    label,
    items,
    isCollapsed,
    onToggle,
}: NavGroup & {
    isCollapsed: boolean
    onToggle: () => void
}) {
    return (
        <Fragment>
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={!isCollapsed}
                className={cn(
                    "pt-3 pb-1 flex w-full items-center justify-between",
                    "text-base font-light cursor-pointer",
                    "text-muted-foreground hover:text-foreground"
                )}
            >
                {label}
                <HugeiconsIcon
                    icon={ChevronDownIcon}
                    className={cn(
                        "size-3.5 transition-transform duration-150",
                        isCollapsed && "-rotate-90"
                    )}
                />
            </button>
            {!isCollapsed && (
                <div className="flex gap-2 pl-1">
                    <span className="w-px shrink-0 bg-border" />
                    <nav className="flex w-full flex-col">
                        {items.map((item) => (
                            <NavLink
                                key={item.path}
                                {...item}
                                compact
                            />
                        ))}
                    </nav>
                </div>
            )}
        </Fragment>
    )
}
