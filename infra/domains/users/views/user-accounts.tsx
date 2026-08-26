import type { FC } from "react"
import type { UserDetail } from "@/domains/users"
import { formatUtc } from "@infra/ui/lib/date"

export type UserAccountsProps = {
    viewUser: UserDetail
}

export const UserAccounts: FC<UserAccountsProps> = ({ viewUser }) => (
    <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Connected accounts</h3>
        {viewUser.accounts.length === 0 && (
            <p className="text-xs text-muted-foreground">
                No connected accounts.
            </p>
        )}
        {viewUser.accounts.map((account) => (
            <div
                key={account.id}
                className="flex flex-col gap-1 border border-input px-2.5 py-1.5 text-xs"
            >
                <div className="flex items-center justify-between">
                    <span className="capitalize">{account.providerId}</span>
                    <span className="text-muted-foreground">
                        linked {formatUtc(account.createdAt, "PPP")}
                    </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                    <span>{account.issuer}</span>
                    {account.scopes.length > 0 && (
                        <span className="truncate">{account.scopes.join(", ")}</span>
                    )}
                </div>
            </div>
        ))}
    </section>
)
