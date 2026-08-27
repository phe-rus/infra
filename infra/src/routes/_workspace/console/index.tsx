import { createFileRoute, Link } from "@tanstack/react-router"
import {
    consoleOptions,
    CREATE_CLIENT_ID,
    useConsole,
    useRemoveApp,
    useRotateApp,
    useSetAppActive,
} from "@/domains/console"
import { buttonVariants } from "@infra/ui/components/button"
import { ListApplications } from "@/domains/console"
import { cn } from "@infra/ui/lib/utils"
import { ViewController } from "@infra/ui/widgets/view-controller"

export const Route = createFileRoute("/_workspace/console/")({
    loader: async ({ context: { q } }) => {
        await q.query({ ...consoleOptions(), staleTime: 'static' })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = useConsole()
    const { mutateAsync: setAppActive } = useSetAppActive()
    const { mutateAsync: rotateApp } = useRotateApp()
    const { mutateAsync: removeApp } = useRemoveApp()

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Console"
                    description="Applications registered to use this instance."
                    action={
                        <Link
                            to="/console/$client_id"
                            params={{ client_id: CREATE_CLIENT_ID }}
                            className={cn(buttonVariants({ size: "sm" }))}
                        >
                            Add application
                        </Link>
                    }
                />
            }
        >
            <ListApplications
                applications={data.applications}
                onSetActive={(clientId, active) =>
                    void setAppActive({ data: { clientId, active } })
                }
                onRotate={(clientId) => void rotateApp({ data: { clientId } })}
                onRemove={(clientId) => void removeApp({ data: { clientId } })}
            />
        </ViewController>
    )
}
