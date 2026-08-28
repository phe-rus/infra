import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { currentOptions } from "@/domains/auth"
import { ViewController } from "@infra/ui/widgets/view-controller"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@infra/ui/components/avatar"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@infra/ui/components/input-group"
import { IconSearch } from "@tabler/icons-react"
import { useMemo } from "react"
import { resolveCdnUrl } from "@/lib/auth-client"

export const Route = createFileRoute("/_workspace/")({
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
        <ViewController
            heading={
                <>
                    <Avatar className="mx-auto! size-55! flex-none">
                        <AvatarImage src={resolveCdnUrl(user?.image)} />
                        <AvatarFallback>
                            {user?.shortHand}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-center">
                        <h2 className="text-2xl font-bold">
                            {user?.name}
                        </h2>
                        <p className="text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </>
            }
        >
            <InputGroup className="mx-auto md:max-w-md!">
                <InputGroupInput placeholder="Search your account" />
                <InputGroupAddon>
                    <IconSearch />
                </InputGroupAddon>
            </InputGroup>
        </ViewController>
    )
}
