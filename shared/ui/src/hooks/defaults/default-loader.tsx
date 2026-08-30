import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { cn } from "../../lib/utils"

export function DefaultLoader() {
    return (
        <section
            className={cn(
                "flex h-screen w-screen items-center justify-center",
                "bg-background"
            )}
        >
            <HugeiconsIcon icon={Loading03Icon} className="size-5! animate-spin duration-500" />
        </section>
    )
}
