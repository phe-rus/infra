import { createFileRoute, Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import { cn } from "@infra/ui/lib/utils"
import { buttonVariants } from "@infra/ui/components/button"
import { statsOptions, useStats } from "@/domains/stats"
import {
    consoleOptions,
    useConsole,
    CREATE_CLIENT_ID,
    ApplicationGrid,
} from "@/domains/console"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { ContentView } from "@infra/ui/widgets/content-view"

export const Route = createFileRoute("/_workspace/")({
    loader: async ({ context: { q } }) => {
        await Promise.all([
            q.query({ ...statsOptions(), staleTime: 'static' }),
            q.query({ ...consoleOptions(), staleTime: 'static' }),
        ])
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { session } = Route.useRouteContext()
    const { data: stats } = useStats()
    const { data: apps } = useConsole()

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title={`Good morning, ${session?.user?.name ?? "there!"}`}
                    description="Here's what's happening with your business"
                />
            }
        >
            <ContentView variant="elevated">
                <ContentView.Row className="gap-3 p-3">
                    <HugeiconsIcon icon={InformationCircleIcon} />
                    <ContentView.H2 className="flex items-center gap-1 text-sm">
                        Your code and connections all look good
                        <Link
                            to="/logs"
                            className="cursor-pointer hover:underline"
                        >
                            View status page
                        </Link>
                    </ContentView.H2>
                </ContentView.Row>
            </ContentView>

            <ContentView.Section>
                <ContentView.H1>Your business</ContentView.H1>
                <ContentView variant="elevated">
                    <ContentView.Row className="mx-auto w-full justify-evenly gap-5 p-5">
                        <ContentView.Header
                            heading="Monthly active users"
                            p="Last 30 days"
                        >
                            <h1>{stats.monthlyActiveUsers}</h1>
                        </ContentView.Header>
                        <ContentView.Divider />
                        <ContentView.Header heading="Total users" p="Current">
                            <h1>{stats.totalUsers}</h1>
                        </ContentView.Header>
                    </ContentView.Row>
                </ContentView>
            </ContentView.Section>

            <ContentView.Section>
                <ContentView.Row className="justify-between">
                    <ContentView.H2>Your applications</ContentView.H2>
                    <Link
                        to="/console/$client_id"
                        params={{ client_id: CREATE_CLIENT_ID }}
                        className={cn(buttonVariants({ size: "sm" }))}
                    >
                        Add application
                    </Link>
                </ContentView.Row>
                <ApplicationGrid data={apps} />
            </ContentView.Section>
        </ViewController>
    )
}
