import { createFileRoute } from "@tanstack/react-router"
import { useLogout } from "@/domains/auth"
import { Button } from "@infra/ui/components/button"
import { ViewController } from "@infra/ui/widgets/view-controller"

export const Route = createFileRoute("/_protected/unauthorized")({
    component: RouteComponent,
})

function RouteComponent() {
    const { isPending, mutateAsync: signOut } = useLogout()

    return (
        <ViewController
            className="m-auto items-center py-20 text-center md:max-w-md"
            heading={
                <ViewController.Heading
                    title="Access restricted"
                    description="Your account doesn't have a role that's permitted to access this instance. Ask an owner or admin to grant your role access."
                />
            }
        >
            <Button
                className="mt-3"
                onClick={() => signOut({})}
                isDisabled={isPending}
            >
                {isPending ? "Signing out…" : "Sign out"}
            </Button>
        </ViewController>
    )
}
