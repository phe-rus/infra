import { useState } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { listQueryOptions } from "@/domains/storage"
import { isAdminTier } from "@infra/auth/permissions"
import { Button } from "@infra/ui/components/button"
import { BrowseObjects } from "@/domains/storage"

export const Route = createFileRoute("/_workspace/storage")({
    beforeLoad: ({ context: { user } }) => {
        if (!isAdminTier(user.role ?? "")) {
            throw redirect({
                to: "/unauthorized",
                replace: true,
            })
        }
    },
    loader: async ({ context: { q } }) => {
        await q.ensureQueryData(listQueryOptions(""))
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
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-3xl">
            <section>
                <h1 className="text-3xl md:text-4xl">Storage</h1>
                <p className="text-muted-foreground">Browse everything in the bucket.</p>
            </section>

            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                <Button type="button" variant="ghost" size="xs" onClick={() => setPrefix("")}>
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
        </article>
    )
}
