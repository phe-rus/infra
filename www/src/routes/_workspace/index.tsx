import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { currentOptions } from "@/functions/get-auth"
import { cn } from "@infra/ui/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@infra/ui/components/avatar"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@infra/ui/components/input-group"
import { IconSearch } from '@tabler/icons-react'
import { useMemo } from "react"

export const Route = createFileRoute("/_workspace/")({
    component: RouteComponent,
})

const date = new Date()
function RouteComponent() {
    const { data: session } = useSuspenseQuery(currentOptions())

    const greeting = () => {
        const hour = date.getHours()
        if (hour < 5) return 'Good night'
        if (hour < 12) return 'Good morning'
        if (hour < 17) return 'Good afternoon'
        if (hour < 22) return 'Good evening'
        return 'Good night'
    }

    const user = useMemo(() => {
        if (!session?.user) return null
        const { email, name, ...user } = session.user
        const shortHand = name?.slice(0, 2).toUpperCase() ?? 'INF'

        return {
            ...user,
            name: name ?? 'Unknown',
            email: email,
            shortHand: shortHand,
            greeting: greeting()
        }
    }, [session])

    return (
        <article className={cn(
            'container mx-auto flex w-full flex-col',
            ' gap-5 py-20 md:max-w-3xl'
        )}>
            <section>
                <Avatar className='size-55! mx-auto! flex-none'>
                    <AvatarImage src={user?.image ?? undefined} />
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
                <h1>Holla, {user?.name}! {user?.greeting}</h1>
                <p className="text-muted-foreground md:max-w-md mx-auto">
                    Here&apos;s what&apos;s happening with your account,
                    only you can manage and edit the settings of your
                    account.
                </p>
            </section>
        </article>
    )
}
