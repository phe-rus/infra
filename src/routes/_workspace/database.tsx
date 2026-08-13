import { useState } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import {
    applicationsQueryOptions,
    useApplications,
    useRemoveApplication,
    useRotateApplication,
    useSetApplicationActive,
} from "@/kit/hypermedia/applications"
import { isAdminTier } from "@/auth/permissions"
import { Button } from "@/components/ui/button"
import { ListApplications, CreateApplication, GetApplicationDetail } from "@/features/database"

export const Route = createFileRoute("/_workspace/database")({
    beforeLoad: ({ context: { user } }) => {
        if (!isAdminTier(user.role ?? "")) {
            throw redirect({
                to: "/unauthorized",
                replace: true,
            })
        }
    },
    loader: async ({ context: { q } }) => {
        await q.ensureQueryData(applicationsQueryOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = useApplications()
    const { mutateAsync: setApplicationActive } = useSetApplicationActive()
    const { mutateAsync: rotateApplication } = useRotateApplication()
    const { mutateAsync: removeApplication } = useRemoveApplication()

    const [createOpen, setCreateOpen] = useState(false)
    const [viewApplicationId, setViewApplicationId] = useState<string | null>(null)

    return (
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-3xl">
            <section>
                <h1 className="text-3xl md:text-4xl">Database</h1>
                <p className="text-muted-foreground">Applications registered to use this instance.</p>
            </section>

            <section className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground">Applications registered to use this instance's auth.</p>
                <Button size="sm" type="button" onClick={() => setCreateOpen(true)}>
                    Add application
                </Button>
            </section>

            <ListApplications
                applications={data.applications}
                onView={setViewApplicationId}
                onSetActive={(applicationId, active) => void setApplicationActive({ data: { applicationId, active } })}
                onRotate={(applicationId) => void rotateApplication({ data: { applicationId } })}
                onRemove={(applicationId) => void removeApplication({ data: { applicationId } })}
            />

            <CreateApplication open={createOpen} onOpenChange={setCreateOpen} />

            <GetApplicationDetail
                applicationId={viewApplicationId}
                applications={data.applications}
                onClose={() => setViewApplicationId(null)}
            />
        </article>
    )
}
