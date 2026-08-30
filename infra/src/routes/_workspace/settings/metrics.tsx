import { eventMetricsOptions, useEventMetrics } from "@/domains/stats"
import { ContentView } from "@infra/ui/widgets/content-view"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_workspace/settings/metrics")({
    loader: async ({ context: { q } }) => {
        await q.query({ ...eventMetricsOptions(), staleTime: 'static' })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = useEventMetrics()

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Metrics"
                    description="Auth and management activity over the last 7 days."
                />
            }
        >
            <ContentView.Section>
                <ContentView.H1>Auth events by path</ContentView.H1>
                <ContentView variant="elevated">
                    {data.authByPath.length === 0 ? (
                        <ContentView.Row className="p-3 text-sm text-muted-foreground">
                            No auth events in the last 7 days.
                        </ContentView.Row>
                    ) : (
                        data.authByPath.map((row) => (
                            <ContentView.Row key={row.path} className="justify-between p-3">
                                <span className="text-sm">{row.path}</span>
                                <span className="text-sm font-medium">{row.count}</span>
                            </ContentView.Row>
                        ))
                    )}
                </ContentView>
            </ContentView.Section>

            <ContentView.Section>
                <ContentView.H1>Management events by action</ContentView.H1>
                <ContentView variant="elevated">
                    {data.managementByAction.length === 0 ? (
                        <ContentView.Row className="p-3 text-sm text-muted-foreground">
                            No management events in the last 7 days.
                        </ContentView.Row>
                    ) : (
                        data.managementByAction.map((row) => (
                            <ContentView.Row key={row.action} className="justify-between p-3">
                                <span className="text-sm">{row.action}</span>
                                <span className="text-sm font-medium">{row.count}</span>
                            </ContentView.Row>
                        ))
                    )}
                </ContentView>
            </ContentView.Section>
        </ViewController>
    )
}
