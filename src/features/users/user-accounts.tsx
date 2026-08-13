import type { FC } from "react"
import type { UserDetail } from "@/kit/users"
import { format } from "date-fns/format"

export type UserAccountsProps = {
    viewUser: UserDetail
}

export const UserAccounts: FC<UserAccountsProps> = ({ viewUser }) => (
    <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Connected accounts</h3>
        {viewUser.accounts.length === 0 && (
            <p className="text-xs text-muted-foreground">No connected accounts.</p>
        )}
        {viewUser.accounts.map((account) => (
            <div
                key={account.id}
                className="flex items-center justify-between border border-input px-2.5 py-1.5 text-xs"
            >
                <span className="capitalize">{account.providerId}</span>
                <span className="text-muted-foreground">linked {format(account.createdAt, "PPP")}</span>
            </div>
        ))}
    </section>
)
