import { IconLoader2 } from "@tabler/icons-react"
import { cn } from "../../lib/utils"

export function DefaultLoader() {
    return (
        <section
            className={cn("flex h-screen w-screen items-center justify-center", "bg-background")}
        >
            <IconLoader2 className="size-5! animate-spin duration-500" />
        </section>
    )
}
