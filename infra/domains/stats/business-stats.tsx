import type { FC } from "react"
import type { StatsData } from "@/domains/stats"
import { cn } from "@infra/ui/lib/utils"

type BusinessStatsProps = {
    data: StatsData
}

export const BusinessStats: FC<BusinessStatsProps> = ({ data }) => {
    return (
        <article
            className={cn(
                "flex items-center gap-5 rounded-2xl bg-card p-5",
                "shadow border border-border/35 hover:shadow-md",
                "cursor-pointer"
            )}
        >
            <div className="mx-auto flex w-full items-center justify-evenly gap-5">
                <div>
                    <h3>Monthly active users</h3>
                    <p>Last 30 days</p>
                    <h1>{data.monthlyActiveUsers}</h1>
                </div>
                <span className="h-16 w-px bg-border" />
                <div>
                    <h3>Total users</h3>
                    <p>Current</p>
                    <h1>{data.totalUsers}</h1>
                </div>
            </div>
        </article>
    )
}
