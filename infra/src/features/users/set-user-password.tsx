import { type FC, useState } from "react"
import { Field, FieldLabel } from "@infra/ui/components/field"
import { Input } from "@infra/ui/components/input"
import { Button } from "@infra/ui/components/button"
import { useSetUserPassword } from "@/kit/users"

export type SetUserPasswordProps = {
    userId: string
}

export const SetUserPassword: FC<SetUserPasswordProps> = ({ userId }) => {
    const { mutateAsync: setPassword } = useSetUserPassword()
    const [newPassword, setNewPassword] = useState("")

    async function handleSetPassword() {
        await setPassword({ data: { userId, newPassword } })
        setNewPassword("")
    }

    return (
        <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Set new password</h3>
            <Field>
                <FieldLabel htmlFor="new-password" className="sr-only">
                    New password
                </FieldLabel>
                <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                />
            </Field>
            <Button
                type="button"
                variant="outline"
                isDisabled={newPassword.length < 8}
                onClick={() => void handleSetPassword()}
            >
                Set password
            </Button>
        </section>
    )
}
