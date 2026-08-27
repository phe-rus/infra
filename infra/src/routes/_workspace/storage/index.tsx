import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { listOptions } from "@/domains/storage"
import { Button } from "@infra/ui/components/button"
import { BrowseObjects } from "@/domains/storage"
import { ViewController } from "@infra/ui/widgets/view-controller"

export const Route = createFileRoute("/_workspace/storage/")({
    loader: async ({ context: { q } }) => {
        await q.query({ ...listOptions(""), staleTime: 'static' })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const [prefix, setPrefix] = useState("")
    const segments = prefix.split("/").filter(Boolean)

    function crumbPrefix(index: number): string {
        return `${segments.slice(0, index + 1).join("/")}/`
    }

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Storage"
                    description="Browse everything in the bucket."
                />
            }
        >
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setPrefix("")}
                >
                    Storage
                </Button>
                {segments.map((segment, index) => (
                    <span key={index} className="flex items-center gap-1">
                        <span>/</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => setPrefix(crumbPrefix(index))}
                        >
                            {segment}
                        </Button>
                    </span>
                ))}
            </nav>

            <BrowseObjects prefix={prefix} onNavigate={setPrefix} />
        </ViewController>
    )
}
