import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_workspace/settings/")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Settings"
                    description="Manage instance settings."
                />
            }
        >
            <div>Hello "/_workspace/settings/"!</div>
        </ViewController>
    )
}
