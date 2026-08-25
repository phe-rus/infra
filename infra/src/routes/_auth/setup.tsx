import { createFileRoute, redirect } from "@tanstack/react-router"
import { RunSetupMigrations } from "@/domains/auth/run-setup-migrations"
import { CreateFirstUser } from "@/domains/auth/create-first-user"
import { useState } from "react"

export const Route = createFileRoute("/_auth/setup")({
    loader: async ({ context: { hasOwner } }) => {
        if (hasOwner) throw redirect({ to: "/sign-in", replace: true })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const [initialized, setInitialized] = useState(false)

    if (!initialized) {
        return <RunSetupMigrations onInitialized={() => setInitialized(true)} />
    }

    return <CreateFirstUser />
}
