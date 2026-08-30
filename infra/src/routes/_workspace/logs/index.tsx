import { recentEventsOptions, useRecentEvents } from "@/domains/stats"
import type { RecentEventsData } from "@/domains/stats"
import { Badge } from "@infra/ui/components/badge"
import { formatUtc } from "@infra/ui/lib/date"
import type { DataTableColumnDef } from "@infra/ui/widgets/tables"
import { DataTable } from "@infra/ui/widgets/tables"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"

export const Route = createFileRoute("/_workspace/logs/")({
    loader: async ({ context: { q } }) => {
        await q.query({ ...recentEventsOptions(), staleTime: 'static' })
    },
    component: RouteComponent,
})

type Event = RecentEventsData["events"][number]

function RouteComponent() {
    const { data } = useRecentEvents()

    const columns = useMemo(
        (): DataTableColumnDef<Event>[] => [
            {
                accessorKey: "category",
                header: "Category",
                cell: ({ row }) => (
                    <Badge variant={row.original.category === "auth" ? "secondary" : "outline"}>
                        {row.original.category}
                    </Badge>
                ),
            },
            { accessorKey: "event", header: "Event" },
            {
                accessorKey: "outcome",
                header: "Outcome",
                cell: ({ row }) => {
                    const { outcome } = row.original
                    if (!outcome) return <span className="text-muted-foreground">-</span>
                    return (
                        <Badge variant={outcome === "success" ? "default" : "outline"}>
                            {outcome}
                        </Badge>
                    )
                },
            },
            { accessorKey: "actor", header: "Actor" },
            {
                accessorKey: "target",
                header: "Target",
                cell: ({ row }) =>
                    row.original.target || <span className="text-muted-foreground">-</span>,
            },
            { accessorKey: "ip", header: "IP" },
            {
                accessorKey: "country",
                header: "Location",
                cell: ({ row }) => {
                    const { country, city, region } = row.original
                    if (!country) return <span className="text-muted-foreground">-</span>
                    return [city, region, country].filter(Boolean).join(", ")
                },
            },
            {
                accessorKey: "timestamp",
                header: "Time",
                cell: ({ row }) => formatUtc(row.original.timestamp, "PPp"),
            },
        ],
        []
    )

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Logs"
                    description="Everything happened, eventually."
                />
            }
        >
            <DataTable
                aria-label="Events"
                columns={columns}
                data={data.events}
                getRowId={(row) => `${row.timestamp}-${row.category}-${row.event}-${row.actor}`}
                emptyMessage="No events yet."
            />
        </ViewController>
    )
}
