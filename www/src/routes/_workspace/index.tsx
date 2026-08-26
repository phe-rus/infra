import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { currentOptions } from "@/domains/auth"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { Avatar, AvatarFallback, AvatarImage } from "@infra/ui/components/avatar"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@infra/ui/components/input-group"
import { ContentView } from "@infra/ui/widgets/content-view"
import { IconSearch, IconWallet } from "@tabler/icons-react"
import { useMemo } from "react"
import { resolveCdnUrl } from "@/lib/auth-client"
import {
    myPaymentsOptions,
    paymentConfigOptions,
    walletsOptions,
    useMyPayments,
    usePaymentConfig,
    useWallets,
    ExpenditureEstimateCard,
    Wallet,
    TransactionHistory,
} from "@/domains/payments"

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
    const { data: payments } = useMyPayments()
    const { data: wallets } = useWallets()
    const { data: config } = usePaymentConfig()

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
        <ViewController
            heading={
                <>
                    <Avatar className="mx-auto! size-55! flex-none">
                        <AvatarImage src={resolveCdnUrl(user?.image)} />
                        <AvatarFallback>{user?.shortHand}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-center">
                        <h2 className="text-2xl font-bold">{user?.name}</h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                </>
            }
        >
            <section>
                <InputGroup className="mx-auto md:max-w-md!">
                    <InputGroupInput placeholder="Search your account" />
                    <InputGroupAddon>
                        <IconSearch />
                    </InputGroupAddon>
                </InputGroup>
            </section>

            <section className="mx-auto flex w-full flex-col gap-5 md:max-w-md">
                <ContentView.Header
                    as="h1"
                    icon={<IconWallet />}
                    heading="Wallets"
                    p="Manage your wallets, accounts, assets, and transactions."
                    pClassName="md:max-w-sm"
                />

                <Wallet.Cards>
                    {wallets.wallets.map((wallet) => (
                        <Wallet.Content
                            key={wallet.id}
                            data={wallet}
                            wallets={wallets.wallets}
                            config={config}
                        />
                    ))}
                    <Wallet.AddTile wallets={wallets.wallets} config={config} />
                </Wallet.Cards>
                <ExpenditureEstimateCard data={payments} />

                <TransactionHistory data={payments} config={config} />
            </section>
        </ViewController>
    )
}
