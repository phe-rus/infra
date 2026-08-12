import { type FC, useState } from "react"
import { DrawerClose } from "@/components/ui/drawer"
import { DialogWidget } from "@/components/widgets/dialog-widget"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FIXED_ROLE_NAMES } from "@/auth/permissions"
import { useCreateUser } from "@/kit/hypermedia/users"

export type CreateUserProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    isOwner: boolean
}

export const CreateUser: FC<CreateUserProps> = ({
    open,
    onOpenChange,
    isOwner
}) => {
    const { mutateAsync: createUser } = useCreateUser()
    const [draftName, setDraftName] = useState("")
    const [draftEmail, setDraftEmail] = useState("")
    const [draftPassword, setDraftPassword] = useState("")
    const [draftRole, setDraftRole] = useState<"owner" | "admin" | "user">("user")

    async function handleAddUser() {
        await createUser({
            data: {
                name: draftName.trim(),
                email: draftEmail.trim(),
                password: draftPassword,
                role: isOwner ? draftRole : "user",
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
            description={
                isOwner
                    ? "Create an account directly with any role."
                    : "New users are added with the user role."
            }
            footer={
                <>
                    <Button
                        type="button"
                        isDisabled={!draftName.trim() || !draftEmail.trim() || draftPassword.length < 8}
                        onClick={() => void handleAddUser()}
                    >
                        Add user
                    </Button>
                    <DrawerClose render={<Button type="button" variant="outline" />}>Cancel</DrawerClose>
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
                    <FieldLabel htmlFor="new-user-password">Password</FieldLabel>
                    <Input
                        id="new-user-password"
                        type="password"
                        autoComplete="new-password"
                        value={draftPassword}
                        onChange={(e) => setDraftPassword(e.target.value)}
                    />
                </Field>
                {isOwner && (
                    <Field>
                        <FieldLabel htmlFor="new-user-role">Role</FieldLabel>
                        <Select
                            id="new-user-role"
                            aria-label="Role"
                            selectedKey={draftRole}
                            onSelectionChange={(key) => setDraftRole(key as "owner" | "admin" | "user")}
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
                )}
            </FieldGroup>
        </DialogWidget>
    )
}
