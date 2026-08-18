import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { currentOptions } from "@/functions/get-auth"
import { cn } from "@infra/ui/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@infra/ui/components/avatar"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@infra/ui/components/input-group"
import { IconSearch, IconWallet } from "@tabler/icons-react"
import { useMemo } from "react"
import { resolveCdnUrl } from "@/lib/auth-client"
import { myPaymentsOptions, paymentConfigOptions, walletsOptions } from "@/functions/get-payments"
import { ExpenditureEstimateCard, WalletCards, TransactionHistory } from "@/features/payments"

export const Route = createFileRoute("/_workspace/")({
    loader: async ({ context }) => {
        await context.q.ensureQueryData(myPaymentsOptions())
        await context.q.ensureQueryData(walletsOptions())
        await context.q.ensureQueryData(paymentConfigOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data: session } = useSuspenseQuery(currentOptions())

    const user = useMemo(() => {
        if (!session?.user) return null
        const { email, name, ...rest } = session.user
        const shortHand = name.slice(0, 2).toUpperCase()

        return {
            ...rest,
            name,
            email: email,
            shortHand: shortHand,
        }
    }, [session])

    return (
        <article
            className={cn("container mx-auto flex w-full flex-col", "gap-5 py-20 md:max-w-3xl")}
        >
            <section>
                <Avatar className="mx-auto! size-55! flex-none">
                    <AvatarImage src={resolveCdnUrl(user?.image)} />
                    <AvatarFallback>{user?.shortHand}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-center">
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                </div>
            </section>

            <section>
                <InputGroup className="mx-auto md:max-w-md!">
                    <InputGroupInput placeholder="Search your account" />
                    <InputGroupAddon>
                        <IconSearch />
                    </InputGroupAddon>
                </InputGroup>
            </section>

            <section className="mx-auto flex w-full flex-col gap-5 md:max-w-md">
                <div>
                    <h1 className="flex items-center gap-2">
                        <IconWallet />
                        Wallets
                    </h1>
                    <p className="md:max-w-sm">
                        Manage your wallets, accounts, assets, and transactions.
                    </p>
                </div>

                <WalletCards />
                <ExpenditureEstimateCard />

                <TransactionHistory />
            </section>
        </article>
    )
}
