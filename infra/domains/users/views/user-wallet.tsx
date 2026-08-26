import type { FC } from "react"
import { useUserWallet } from "@/domains/users"

export type UserWalletProps = {
    userId: string
    enabled: boolean
}

export const UserWallet: FC<UserWalletProps> = ({ userId, enabled }) => {
    const { data, isLoading, isError } = useUserWallet(userId, enabled)

    if (isLoading) {
        return <p className="text-xs text-muted-foreground">Loading…</p>
    }

    if (isError || !data) {
        return (
            <p className="text-xs text-muted-foreground">
                Dodo payments are not configured on this instance.
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Balance</h3>
                {data.entitlements.length === 0 && (
                    <p className="text-xs text-muted-foreground">No balance.</p>
                )}
                {data.entitlements.map((entitlement) => (
                    <div
                        key={entitlement.id}
                        className="flex items-center justify-between border border-input px-2.5 py-1.5 text-xs"
                    >
                        <span>{entitlement.name}</span>
                        <span className="text-muted-foreground">
                            {entitlement.balance} {entitlement.unit}
                        </span>
                    </div>
                ))}
            </section>

            <section className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Saved cards</h3>
                {data.paymentMethods.length === 0 && (
                    <p className="text-xs text-muted-foreground">No saved cards.</p>
                )}
                {data.paymentMethods.map((method) => (
                    <div
                        key={method.id}
                        className="flex items-center justify-between border border-input px-2.5 py-1.5 text-xs"
                    >
                        <span className="capitalize">
                            {method.brand ?? "Card"} •••• {method.last4 ?? "----"}
                        </span>
                        {method.expiryMonth && method.expiryYear && (
                            <span className="text-muted-foreground">
                                {method.expiryMonth}/{method.expiryYear}
                            </span>
                        )}
                    </div>
                ))}
            </section>
        </div>
    )
}
