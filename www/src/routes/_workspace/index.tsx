import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { currentOptions } from "@/functions/get-auth"
import { cn } from "@infra/ui/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@infra/ui/components/avatar"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@infra/ui/components/input-group"
import { IconCards, IconSearch, IconWallet } from '@tabler/icons-react'
import { useMemo } from "react"
import { resolveCdnUrl } from "@/lib/auth-client"
import { myPaymentsOptions, paymentConfigOptions, useWallets, walletsOptions } from "@/functions/get-payments"
import { ExpenditureEstimateCard, ManageWalletsDialog, TransactionHistory } from "@/features/payments"

export const Route = createFileRoute("/_workspace/")({
    loader: async ({ context }) => {
        await Promise.all([
            context.q.ensureQueryData(myPaymentsOptions()),
            context.q.ensureQueryData(walletsOptions()),
            context.q.ensureQueryData(paymentConfigOptions()),
        ])
    },
    component: RouteComponent,
})

const date = new Date()

function RouteComponent() {
    const { data: session } = useSuspenseQuery(currentOptions())

    const greeting = useMemo(() => {
        const hour = date.getHours()
        if (hour < 5) return 'Good night'
        if (hour < 12) return 'Good morning'
        if (hour < 17) return 'Good afternoon'
        if (hour < 22) return 'Good evening'
        return 'Good night'
    }, [date])

    const user = useMemo(() => {
        if (!session?.user) return null
        const { email, name, ...user } = session.user
        const shortHand = name?.slice(0, 2).toUpperCase() ?? 'INF'

        return {
            ...user,
            name: name ?? 'Unknown',
            email: email,
            shortHand: shortHand,
            greeting: greeting
        }
    }, [session, greeting])

    return (
        <article className={cn(
            'container mx-auto flex w-full flex-col',
            ' gap-5 py-20 md:max-w-3xl'
        )}>
            <section>
                <Avatar className='size-55! mx-auto! flex-none'>
                    <AvatarImage src={resolveCdnUrl(user?.image)} />
                    <AvatarFallback>{user?.shortHand}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-center">
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                </div>
            </section>

            <section>
                <InputGroup className='md:max-w-md! mx-auto'>
                    <InputGroupInput placeholder='Search your account' />
                    <InputGroupAddon>
                        <IconSearch />
                    </InputGroupAddon>
                </InputGroup>
            </section>

            <section className="flex flex-col text-center">
                <h1 suppressHydrationWarning>
                    Holla, {user?.name}! {user?.greeting}
                </h1>
                <p className="text-muted-foreground md:max-w-md mx-auto">
                    Here&apos;s what&apos;s happening with your account,
                    only you can manage and edit the settings of your
                    account.
                </p>
            </section>

            <section className='flex flex-col gap-5 w-full md:max-w-md mx-auto'>
                <div>
                    <h1 className='flex items-center gap-2'>
                        <IconWallet />
                        Wallets
                    </h1>
                    <p className='md:max-w-sm'>
                        Manage your wallets, accounts, assets, and transactions.
                    </p>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <PrimaryWalletCard />
                    <ExpenditureEstimateCard />
                </div>

                <TransactionHistory />
            </section>
        </article>
    )
}

function PrimaryWalletCard() {
    const { data } = useWallets()
    const primary = data.wallets.find((wallet) => wallet.isPrimary) ?? data.wallets[0]

    return (
        <ManageWalletsDialog className={cn(
            'p-5 rounded-md bg-input/35 group',
            'relative overflow-hidden text-left'
        )}>
            <h2 className='font-bold'>{primary ? primary.label || "Primary" : "Add a number"}</h2>
            <p className='text-sm md:max-w-md'>
                {primary ? primary.phoneNumber : "Save a mobile money number"}
            </p>
            <div className={cn(
                'absolute top-0 right-0 rounded-bl-2xl',
                'bg-input/35 p-3',
            )}>
                <IconCards className={cn(
                    'group-hover:translate-x-1 group-hover:translate-y-1',
                    'transition-all duration-300'
                )} />
            </div>
        </ManageWalletsDialog>
    )
}
