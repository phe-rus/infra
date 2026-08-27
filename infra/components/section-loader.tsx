import { IconLoader2 } from "@tabler/icons-react"
import { cn } from "@infra/ui/lib/utils"

export function SectionLoader({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "flex w-full items-center justify-center py-10",
                className
            )}
        >
            <IconLoader2 className="size-5! animate-spin text-muted-foreground duration-500" />
        </div>
    )
}
