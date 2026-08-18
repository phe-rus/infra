import { createFileRoute, Link } from "@tanstack/react-router"
import { IconInfoCircle } from "@tabler/icons-react"
import { cn } from "@infra/ui/lib/utils"
import { buttonVariants } from "@infra/ui/components/button"
import { statsQueryOptions, useStats } from "@/kit/stats"
import { consoleOptions, useConsole, CREATE_CLIENT_ID } from "@/kit/console"
import { BusinessStats, ApplicationGrid } from "@/features/dashboard"
import { WalletBalances } from "@/features/payments"

export const Route = createFileRoute("/_workspace/")({
    loader: async ({ context: { q } }) => {
        await Promise.all([
            q.ensureQueryData(statsQueryOptions()),
            q.ensureQueryData(consoleOptions()),
        ])
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data: stats } = useStats()
    const { data: apps } = useConsole()

    return (
        <article
            className={cn("container mx-auto flex w-full flex-col md:max-w-3xl", "gap-5 py-20")}
        >
            <section>
                <h1 className="text-3xl md:text-4xl">Good morning, Pherus</h1>
                <p>Here&apos;s what&apos;s happening with pherus</p>
            </section>

            <section className="rounded-2xl bg-card">
                <div className="flex items-center gap-3 p-3">
                    <IconInfoCircle />
                    <h2 className="flex items-center gap-1 text-sm">
                        Your code and connections all look good
                        <span className="cursor-pointer hover:underline">View status page</span>
                    </h2>
                </div>
            </section>

            <section className="flex flex-col gap-3">
                <h2>Your business</h2>
                <BusinessStats data={stats} />
            </section>

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2>Your applications</h2>
                    <Link
                        to="/console/$client_id"
                        params={{ client_id: CREATE_CLIENT_ID }}
                        className={cn(buttonVariants({ size: "sm" }))}
                    >
                        Add application
                    </Link>
                </div>
                <ApplicationGrid data={apps} />
            </section>

            <WalletBalances />
        </article>
    )
}
