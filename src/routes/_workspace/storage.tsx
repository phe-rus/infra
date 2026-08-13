import { createFileRoute, redirect } from "@tanstack/react-router"
import { browseQueryOptions } from "@/kit/hypermedia/objects"
import { isAdminTier } from "@/auth/permissions"
import { StoragePage } from "@/features/storage"

export const Route = createFileRoute("/_workspace/storage")({
    beforeLoad: ({ context: { user } }) => {
        if (!isAdminTier(user.role ?? "")) {
            throw redirect({
                to: "/unauthorized",
                replace: true
            })
        }
    },
    loader: async ({ context: { q } }) => {
        await q.ensureQueryData(browseQueryOptions(""))
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-3xl">
            <section>
                <h1 className="text-3xl md:text-4xl">Storage</h1>
                <p className="text-muted-foreground">Browse everything in the bucket.</p>
            </section>
            <StoragePage />
        </article>
    )
}
