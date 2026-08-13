import { useStats } from "@/kit/hypermedia/stats"

export function BusinessStats() {
    const { data } = useStats()

    return (
        <article className="flex items-center gap-5 p-5 rounded-2xl bg-card">
            <div className="flex items-center justify-evenly gap-5 w-full mx-auto">
                <div>
                    <h3>Monthly active users</h3>
                    <p>Last 30 days</p>
                    <h1>{data.monthlyActiveUsers}</h1>
                </div>
                <span className="bg-border w-px h-16" />
                <div>
                    <h3>Total users</h3>
                    <p>Current</p>
                    <h1>{data.totalUsers}</h1>
                </div>
            </div>
        </article>
    )
}
