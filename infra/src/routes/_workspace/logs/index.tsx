import { createFileRoute } from "@tanstack/react-router"
import { ViewController } from "@infra/ui/widgets/view-controller"

export const Route = createFileRoute("/_workspace/logs/")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Logs"
                    description="Everything happened, eventually."
                />
            }
        />
    )
}
