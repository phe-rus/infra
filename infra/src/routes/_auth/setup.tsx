import { createFileRoute, redirect } from "@tanstack/react-router"
import { RunSetupMigrations } from "@/domains/auth/views/run-setup-migrations"
import { CreateFirstUser } from "@/domains/auth/views/create-first-user"
import { useState } from "react"

export const Route = createFileRoute("/_auth/setup")({
    loader: async ({ context: { hasAdmin } }) => {
        if (hasAdmin) throw redirect({ to: "/sign-in", replace: true })
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
