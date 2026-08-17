import { useMemo } from "react"
import { cn } from "@infra/ui/lib/utils"
import { IconTrendingUp } from "@tabler/icons-react"
import { useMyPayments } from "@/functions/get-payments"

export function ExpenditureEstimateCard() {
    const { data } = useMyPayments()

    const estimate = useMemo(() => {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const dayOfMonth = now.getDate()

        const thisMonth = data.payments.filter(
            (p) =>
                p.type === "deposit" &&
                p.status === "completed" &&
                new Date(p.createdAt) >= monthStart
        )
        const currency = thisMonth[0]?.currency ?? data.payments[0]?.currency ?? ""
        const spent = thisMonth.reduce((sum, p) => sum + Number(p.amount), 0)
        const projected = dayOfMonth > 0 ? (spent / dayOfMonth) * daysInMonth : spent

        return { currency, spent, projected }
    }, [data.payments])

    return (
        <article
            className={cn(
                "group rounded-md bg-input/35 p-5",
                "relative flex flex-col justify-between overflow-hidden"
            )}
        >
            <h2 className="font-bold">Estimated</h2>
            <div>
                <p className="text-sm">
                    {estimate.currency} {estimate.spent.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                    {estimate.projected > estimate.spent
                        ? `~${estimate.currency} ${Math.round(estimate.projected).toLocaleString()} projected this month`
                        : "This month"}
                </p>
            </div>
            <div className={cn("absolute top-0 right-0 rounded-bl-2xl", "bg-input/35 p-3")}>
                <IconTrendingUp
                    className={cn(
                        "group-hover:translate-x-1 group-hover:-translate-y-1",
                        "transition-all duration-300"
                    )}
                />
            </div>
        </article>
    )
}
