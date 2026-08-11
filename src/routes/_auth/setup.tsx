import {
    authSettingsQueryOptions,
    emailPasswordAuthSettingsQueryOptions,
    securityAuthSettingsQueryOptions,
} from "@/hooks/settingsHooks"
import { instanceAppNameQueryOptions } from "@/hooks/instanceHooks"
import { customRolesQueryOptions } from "@/hooks/rolesHooks"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { SetupWizard } from "@/components/auth"

export const Route = createFileRoute("/_auth/setup")({
    loader: async ({ context: { q, hasOwner } }) => {
        if (hasOwner) throw redirect({
            to: "/sign-in",
            replace: true
        })
        const [authMethods, { appName }, security, emailPassword, customRoles] = await Promise.all([
            q.ensureQueryData(authSettingsQueryOptions()),
            q.ensureQueryData(instanceAppNameQueryOptions()),
            q.ensureQueryData(securityAuthSettingsQueryOptions()),
            q.ensureQueryData(emailPasswordAuthSettingsQueryOptions()),
            q.ensureQueryData(customRolesQueryOptions()),
        ])
        return { authMethods, appName, security, emailPassword, customRoles }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { authMethods, appName, security, emailPassword, customRoles } = Route.useLoaderData()
    return (
        <SetupWizard
            initialAppName={appName}
            initialSecurity={security}
            initialEmailPassword={emailPassword}
            initialAuthMethods={authMethods}
            initialCustomRoles={customRoles}
        />
    )
}
