import { recentEventsOptions, useRecentEvents } from "@/domains/stats"
import { Badge } from "@infra/ui/components/badge"
import { formatUtc } from "@infra/ui/lib/date"
import { ContentView } from "@infra/ui/widgets/content-view"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_workspace/logs/")({
    loader: async ({ context: { q } }) => {
        await q.query({ ...recentEventsOptions(), staleTime: 'static' })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = useRecentEvents()

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Logs"
                    description="Everything happened, eventually."
                />
            }
        >
            <ContentView.Section>
                <ContentView.H1>Auth events</ContentView.H1>
                <ContentView variant="elevated">
                    {data.authEvents.length === 0 ? (
                        <ContentView.Row className="p-3 text-sm text-muted-foreground">
                            No auth events yet.
                        </ContentView.Row>
                    ) : (
                        data.authEvents.map((event, idx) => (
                            <ContentView.Row key={idx} className="justify-between p-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{event.path}</Badge>
                                    <Badge
                                        variant={
                                            event.outcome === "success" ? "default" : "outline"
                                        }
                                    >
                                        {event.outcome}
                                    </Badge>
                                    {event.country && (
                                        <span className="text-xs text-muted-foreground">
                                            {event.country}
                                            {event.region ? `, ${event.region}` : ""}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {formatUtc(event.timestamp, "PPp")}
                                </span>
                            </ContentView.Row>
                        ))
                    )}
                </ContentView>
            </ContentView.Section>

            <ContentView.Section>
                <ContentView.H1>Management events</ContentView.H1>
                <ContentView variant="elevated">
                    {data.managementEvents.length === 0 ? (
                        <ContentView.Row className="p-3 text-sm text-muted-foreground">
                            No management events yet.
                        </ContentView.Row>
                    ) : (
                        data.managementEvents.map((event, idx) => (
                            <ContentView.Row key={idx} className="justify-between p-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{event.action}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                        by {event.actorId}
                                        {event.targetId ? ` → ${event.targetId}` : ""}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {formatUtc(event.timestamp, "PPp")}
                                </span>
                            </ContentView.Row>
                        ))
                    )}
                </ContentView>
            </ContentView.Section>
        </ViewController>
    )
}
