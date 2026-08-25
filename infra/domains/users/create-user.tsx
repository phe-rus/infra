import { useState } from "react"
import type { FC } from "react"
import { DrawerClose } from "@infra/ui/components/drawer"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { Field, FieldGroup, FieldLabel } from "@infra/ui/components/field"
import { Input } from "@infra/ui/components/input"
import { Button } from "@infra/ui/components/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@infra/ui/components/select"
import { FIXED_ROLE_NAMES } from "@infra/auth/permissions"
import { useCreateUser } from "@/domains/users"

export type CreateUserProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const CreateUser: FC<CreateUserProps> = ({ open, onOpenChange }) => {
    const { mutateAsync: createUser } = useCreateUser()
    const [draftName, setDraftName] = useState("")
    const [draftEmail, setDraftEmail] = useState("")
    const [draftPassword, setDraftPassword] = useState("")
    const [draftRole, setDraftRole] = useState<"admin" | "user">("user")

    async function handleAddUser() {
        await createUser({
            data: {
                name: draftName.trim(),
                email: draftEmail.trim(),
                password: draftPassword,
                role: draftRole,
            },
        })
        setDraftName("")
        setDraftEmail("")
        setDraftPassword("")
        setDraftRole("user")
        onOpenChange(false)
    }

    return (
        <DialogWidget
            open={open}
            onOpenChange={onOpenChange}
            title="Add a user"
            description="Create an account directly with any role."
            footer={
                <>
                    <Button
                        type="button"
                        isDisabled={
                            !draftName.trim() ||
                            !draftEmail.trim() ||
                            draftPassword.length < 8
                        }
                        onClick={() => void handleAddUser()}
                    >
                        Add user
                    </Button>
                    <DrawerClose
                        render={<Button type="button" variant="outline" />}
                    >
                        Cancel
                    </DrawerClose>
                </>
            }
        >
            <FieldGroup className="grid grid-cols-1 gap-3">
                <Field>
                    <FieldLabel htmlFor="new-user-name">Name</FieldLabel>
                    <Input
                        id="new-user-name"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="new-user-email">Email</FieldLabel>
                    <Input
                        id="new-user-email"
                        type="email"
                        value={draftEmail}
                        onChange={(e) => setDraftEmail(e.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="new-user-password">
                        Password
                    </FieldLabel>
                    <Input
                        id="new-user-password"
                        type="password"
                        autoComplete="new-password"
                        value={draftPassword}
                        onChange={(e) => setDraftPassword(e.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="new-user-role">Role</FieldLabel>
                    <Select
                        id="new-user-role"
                        aria-label="Role"
                        selectedKey={draftRole}
                        onSelectionChange={(key) =>
                            setDraftRole(key as "admin" | "user")
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FIXED_ROLE_NAMES.map((role) => (
                                <SelectItem key={role} id={role}>
                                    {role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            </FieldGroup>
        </DialogWidget>
    )
}
