import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
    component: RouteComponent,
})

function RouteComponent() {
    const accountsUrl = import.meta.env.VITE_ACCOUNTS_URL

    return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
            <span className="text-2xl font-semibold tracking-tight">Pherus</span>
            <p className="max-w-md text-muted-foreground">
                Shea nut oil soap, lotion, and gel, made with essential oils.
            </p>
            <a
                href={accountsUrl}
                className="text-sm font-medium underline underline-offset-4"
            >
                Sign in to your account
            </a>
        </main>
    )
}
