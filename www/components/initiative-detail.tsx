import {
    STATUS_LABEL,
    type Domain,
    type Initiative,
} from "@/lib/ecosystem"
import { cn } from "@infra/ui/lib/utils"

/**
 * The one place an initiative's name/description/domain/status renders.
 * Used by both the ecosystem radial and the showcase gallery so the two
 * "select something, see what it is" interactions stay identical.
 */
export function InitiativeDetail({
    item,
    domain,
    className,
}: {
    item: Initiative
    domain?: Domain
    className?: string
}) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <span className="text-xs tracking-wide text-muted-foreground uppercase">
                {domain?.label}
                {item.status
                    ? ` · ${STATUS_LABEL[item.status]}`
                    : ""}
            </span>
            <h3 className="text-xl font-medium tracking-tight md:text-2xl">
                {item.name}
            </h3>
            <p className="text-sm text-muted-foreground md:text-base">
                {item.summary}
            </p>
            {domain && (
                <p className="text-sm text-muted-foreground/70">
                    {domain.description}
                </p>
            )}
        </div>
    )
}
