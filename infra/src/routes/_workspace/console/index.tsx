import { createFileRoute, Link } from "@tanstack/react-router"
import { CREATE_CLIENT_ID, useConsole, useRemoveApp, useRotateApp, useSetAppActive } from "@/kit/console"
import { buttonVariants } from "@infra/ui/components/ui/button"
import { ListApplications } from "@/features/console"
import { cn } from "@infra/ui/lib/utils"

export const Route = createFileRoute("/_workspace/console/")({
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = useConsole()
    const { mutateAsync: setAppActive } = useSetAppActive()
    const { mutateAsync: rotateApp } = useRotateApp()
    const { mutateAsync: removeApp } = useRemoveApp()

    return (
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-3xl">
            <section>
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl md:text-4xl">Console</h1>
                    <Link
                        to="/console/$client_id"
                        params={{ client_id: CREATE_CLIENT_ID }}
                        className={cn(buttonVariants({ size: "sm" }))}
                    >
                        Add application
                    </Link>
                </div>
                <p className="text-muted-foreground">Applications registered to use this instance.</p>
            </section>

            <ListApplications
                applications={data.applications}
                onSetActive={(clientId, active) => void setAppActive({ data: { clientId, active } })}
                onRotate={(clientId) => void rotateApp({ data: { clientId } })}
                onRemove={(clientId) => void removeApp({ data: { clientId } })}
            />
        </article>
    )
}
