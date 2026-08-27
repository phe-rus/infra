import type { FC } from "react"
import { Button } from "@infra/ui/components/button"
import { useImpersonateUser } from "@/domains/users"

export type ImpersonateUserProps = {
    userId: string
    currentUserId: string
}

export const ImpersonateUser: FC<ImpersonateUserProps> = ({
    userId,
    currentUserId,
}) => {
    const { mutateAsync: impersonateUser } = useImpersonateUser(currentUserId)

    return (
        <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Impersonate</h3>
            <p className="text-xs text-muted-foreground">
                Sign in as this user. You can return to your own account from
                anywhere in the app.
            </p>
            <Button
                type="button"
                variant="outline"
                onClick={() => void impersonateUser(userId)}
            >
                Impersonate
            </Button>
        </section>
    )
}
