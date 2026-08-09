import { authSettingsQueryOptions } from "@/functions/settingsFn"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { AuthForm } from "@/components/auth"

export const Route = createFileRoute("/_auth/setup")({
    loader: async ({ context: { q, hasOwner } }) => {
        if (hasOwner) throw redirect({
            to: "/sign-in",
            replace: true
        })
        return {
            authMethods: await q.ensureQueryData(
                authSettingsQueryOptions()
            )
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { authMethods } = Route.useLoaderData()
    return <AuthForm mode="setup" initialAuthMethods={authMethods} />
}
