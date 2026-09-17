import {
    instanceSettingsOptions,
    SettingsForm,
} from "@/domains/settings"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_workspace/settings/")(
    {
        loader: async ({ context: { q } }) => {
            await q.ensureQueryData(instanceSettingsOptions())
        },
        component: RouteComponent,
    }
)

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
            <SettingsForm />
        </ViewController>
    )
}
