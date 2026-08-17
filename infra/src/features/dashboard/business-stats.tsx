import { useStats } from "@/kit/stats"

export function BusinessStats() {
    const { data } = useStats()

    return (
        <article className="flex items-center gap-5 rounded-2xl bg-card p-5">
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
