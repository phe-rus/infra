import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BrowseObjects } from "./browse-objects"

export function StoragePage() {
    const [prefix, setPrefix] = useState("")
    const segments = prefix.split("/").filter(Boolean)

    function crumbPrefix(index: number): string {
        return `${segments.slice(0, index + 1).join("/")}/`
    }

    return (
        <>
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                <Button type="button" variant="ghost" size="xs" onClick={() => setPrefix("")}>
                    Storage
                </Button>
                {segments.map((segment, index) => (
                    <span key={index} className="flex items-center gap-1">
                        <span>/</span>
                        <Button type="button" variant="ghost" size="xs" onClick={() => setPrefix(crumbPrefix(index))}>
                            {segment}
                        </Button>
                    </span>
                ))}
            </nav>

            <BrowseObjects prefix={prefix} onNavigate={setPrefix} />
        </>
    )
}
