import { useMemo } from "react"
import type { FC } from "react"
import { cn } from "@infra/ui/lib/utils"
import { IconTrendingUp } from "@tabler/icons-react"
import type { MyPaymentsData } from "../func"

type ExpenditureEstimateCardProps = {
    data: MyPaymentsData
}

export const ExpenditureEstimateCard: FC<ExpenditureEstimateCardProps> = ({ data }) => {
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
        // both are array-index reads; TS can't prove either array is non-empty at runtime
        const currency = thisMonth[0]?.currency ?? data.payments[0]?.currency ?? ""
        const spent = thisMonth.reduce((sum, p) => sum + Number(p.amount), 0)
        const projected = dayOfMonth > 0 ? (spent / dayOfMonth) * daysInMonth : spent

        return { currency, spent, projected, dayOfMonth, daysInMonth }
    }, [data.payments])

    const progress = (estimate.dayOfMonth / estimate.daysInMonth) * 100

    return (
        <article
            className={cn(
                "group rounded-md bg-input/35 p-5",
                "relative flex flex-col justify-between overflow-hidden"
            )}
        >
            <h2 className="font-bold">Spending</h2>
            <div className="flex flex-col gap-2">
                <div>
                    <p className="text-xs text-muted-foreground">Spent so far</p>
                    <p className="text-lg font-semibold leading-tight">
                        {estimate.currency} {estimate.spent.toLocaleString()}
                    </p>
                </div>
                {estimate.projected > estimate.spent && (
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Projected by month end
                        </p>
                        <p className="text-sm font-medium">
                            ~{estimate.currency}{" "}
                            {Math.round(estimate.projected).toLocaleString()}
                        </p>
                    </div>
                )}
                <div className="flex flex-col gap-1">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-input">
                        <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Day {estimate.dayOfMonth} of {estimate.daysInMonth}
                    </p>
                </div>
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
