import type { FC } from "react"
import { Button } from "@infra/ui/components/button"
import { useDisableUserTwoFactor, type UserDetail } from "@/kit/users"

export type DisableTwoFactorProps = {
    viewUser: UserDetail
}

export const DisableTwoFactor: FC<DisableTwoFactorProps> = ({ viewUser }) => {
    const { mutateAsync: disableTwoFactor, isPending } = useDisableUserTwoFactor()

    return (
        <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Two-factor authentication</h3>
            <p className="text-xs text-muted-foreground">
                This user has 2FA enabled. If they've lost access to their authenticator, disable it here so
                they can sign in and set it up again.
            </p>
            <Button
                type="button"
                variant="outline"
                isDisabled={isPending}
                onClick={() => void disableTwoFactor({ data: { userId: viewUser.user.id } })}
            >
                Disable 2FA
            </Button>
        </section>
    )
}
