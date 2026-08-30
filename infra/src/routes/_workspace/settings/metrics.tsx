import { eventMetricsOptions, useEventMetrics } from "@/domains/stats"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@infra/ui/components/chart"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute } from "@tanstack/react-router"
import { format } from "date-fns"
import { useMemo } from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    XAxis,
} from "recharts"

export const Route = createFileRoute("/_workspace/settings/metrics")({
    loader: async ({ context: { q } }) => {
        await q.query({ ...eventMetricsOptions(), staleTime: 'static' })
    },
    component: RouteComponent,
})

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
]

const authChartConfig = {
    success: { label: "Success", color: "var(--chart-1)" },
    failure: { label: "Failure", color: "var(--chart-2)" },
} satisfies ChartConfig

const managementChartConfig = {
    count: { label: "Actions", color: "var(--chart-1)" },
} satisfies ChartConfig

const countChartConfig = {
    count: { label: "Count", color: "var(--chart-1)" },
} satisfies ChartConfig

function RouteComponent() {
    const { data } = useEventMetrics()

    const authDailyData = useMemo(() => {
        const byDay = new Map<string, { day: string; success: number; failure: number }>()
        for (const row of data.authDaily) {
            const entry = byDay.get(row.day) ?? { day: row.day, success: 0, failure: 0 }
            if (row.outcome === "success") entry.success = row.count
            if (row.outcome === "failure") entry.failure = row.count
            byDay.set(row.day, entry)
        }
        return Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day))
    }, [data.authDaily])

    const managementDailyData = useMemo(
        () =>
            [...data.managementDaily]
                .sort((a, b) => a.day.localeCompare(b.day))
                .map((row) => ({ day: row.day, count: row.count })),
        [data.managementDaily]
    )

    const authByPathData = useMemo(
        () =>
            data.authByPath.map((row, i) => ({
                label: row.path,
                count: row.count,
                fill: CHART_COLORS[i % CHART_COLORS.length],
            })),
        [data.authByPath]
    )

    const managementByActionData = useMemo(
        () => data.managementByAction.map((row) => ({ label: row.action, count: row.count })),
        [data.managementByAction]
    )

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Metrics"
                    description="Auth and management activity over time."
                />
            }
        >
            <div className="flex flex-col gap-3">
                <div>
                    <h2 className="text-sm font-medium">Auth events</h2>
                    <p className="text-xs text-muted-foreground">
                        Success vs. failure, last 14 days
                    </p>
                </div>
                <ChartContainer config={authChartConfig} className="min-h-[280px] w-full">
                    <LineChart accessibilityLayer data={authDailyData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => format(new Date(value), "MMM d")}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line
                            dataKey="success"
                            stroke="var(--color-success)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            dataKey="failure"
                            stroke="var(--color-failure)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </div>

            <div className="columns-1 gap-2 md:columns-2">
                <div className="mb-2 flex break-inside-avoid flex-col gap-3">
                    <div>
                        <h2 className="text-sm font-medium">Management activity</h2>
                        <p className="text-xs text-muted-foreground">
                            Admin actions, last 14 days
                        </p>
                    </div>
                    <ChartContainer config={managementChartConfig} className="min-h-[220px] w-full">
                        <BarChart accessibilityLayer data={managementDailyData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => format(new Date(value), "MMM d")}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="mb-2 flex break-inside-avoid flex-col gap-3">
                    <div>
                        <h2 className="text-sm font-medium">Auth events by path</h2>
                        <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </div>
                    <ChartContainer
                        config={countChartConfig}
                        className="mx-auto aspect-square max-h-[280px]"
                    >
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                            <Pie
                                data={authByPathData}
                                dataKey="count"
                                nameKey="label"
                                innerRadius={60}
                                strokeWidth={5}
                            />
                            <ChartLegend
                                content={<ChartLegendContent nameKey="label" />}
                                className="flex-wrap"
                            />
                        </PieChart>
                    </ChartContainer>
                </div>

                <div className="mb-2 flex break-inside-avoid flex-col gap-3">
                    <div>
                        <h2 className="text-sm font-medium">Management events by action</h2>
                        <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </div>
                    <ChartContainer
                        config={countChartConfig}
                        className="mx-auto aspect-square max-h-[280px]"
                    >
                        <RadarChart data={managementByActionData}>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <PolarGrid />
                            <PolarAngleAxis dataKey="label" />
                            <Radar
                                dataKey="count"
                                fill="var(--color-count)"
                                fillOpacity={0.6}
                                stroke="var(--color-count)"
                            />
                        </RadarChart>
                    </ChartContainer>
                </div>
            </div>
        </ViewController>
    )
}
