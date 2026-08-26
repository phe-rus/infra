import type { FC } from "react"
import { cn } from "@infra/ui/lib/utils"
import { IconCoins } from "@tabler/icons-react"
import { useDodoBalance } from "../use-payments"

export const DodoBalanceCard: FC = () => {
    const { data } = useDodoBalance()
    const entitlements = data?.entitlements ?? []

    if (entitlements.length === 0) return null

    return (
        <article
            className={cn(
                "group rounded-md bg-input/35 p-5",
                "relative flex flex-col justify-between overflow-hidden"
            )}
        >
            <h2 className="font-bold">Balance</h2>
            <div className="flex flex-col gap-2">
                {entitlements.map((entitlement) => (
                    <div key={entitlement.id}>
                        <p className="text-xs text-muted-foreground">
                            {entitlement.name}
                        </p>
                        <p className="text-lg font-semibold leading-tight">
                            {entitlement.balance}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                                {entitlement.unit}
                            </span>
                        </p>
                    </div>
                ))}
            </div>
            <div className={cn("absolute top-0 right-0 rounded-bl-2xl", "bg-input/35 p-3")}>
                <IconCoins
                    className={cn(
                        "group-hover:translate-x-1 group-hover:-translate-y-1",
                        "transition-all duration-300"
                    )}
                />
            </div>
        </article>
    )
}
