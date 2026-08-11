import { createFileRoute, redirect } from "@tanstack/react-router"
import { useLogout } from "@/hooks/authHooks"
import { Button } from "@/components/ui/button"

// root's own session fetch is deliberately non-throwing (see authFn.ts's
// getSession), so this route checks for itself: no session means nothing
// sent you here, bounce to sign-in instead of showing "access restricted"
// to someone who isn't signed in at all.
export const Route = createFileRoute("/_protected/unauthorized")({
    beforeLoad: ({ context: { session } }) => {
        if (!session) throw redirect({ to: "/sign-in", replace: true })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { isPending, mutateAsync: signOut } = useLogout()

    return (
        <div className="container mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
            <h1 className="text-3xl md:text-4xl">Access restricted</h1>
            <p className="text-muted-foreground">
                Your account doesn't have a role that's permitted to access this instance. Ask an
                owner or admin to grant your role access.
            </p>
            <Button className="mt-3" onClick={() => signOut({})} isDisabled={isPending}>
                {isPending ? "Signing out…" : "Sign out"}
            </Button>
        </div>
    )
}
