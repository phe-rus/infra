import { type FC, useEffect, useState } from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUpdateUserDetails } from "@/kit/hypermedia/users"
import type { UserDetail } from "@/kit/types"

export type UpdateUserProps = {
    viewUser: UserDetail
}

export const UpdateUser: FC<UpdateUserProps> = ({ viewUser }) => {
    const { mutateAsync: updateUserDetails } = useUpdateUserDetails()
    const [editName, setEditName] = useState(viewUser.user.name)
    const [editEmail, setEditEmail] = useState(viewUser.user.email)

    useEffect(() => {
        setEditName(viewUser.user.name)
        setEditEmail(viewUser.user.email)
    }, [viewUser.user.id])

    async function handleUpdateDetails() {
        await updateUserDetails({
            data: { userId: viewUser.user.id, name: editName.trim(), email: editEmail.trim() },
        })
    }

    return (
        <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Details</h3>
            <Field>
                <FieldLabel htmlFor="edit-user-name">Name</FieldLabel>
                <Input id="edit-user-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </Field>
            <Field>
                <FieldLabel htmlFor="edit-user-email">Email</FieldLabel>
                <Input
                    id="edit-user-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                />
            </Field>
            <Button
                type="button"
                variant="outline"
                isDisabled={
                    !editName.trim() ||
                    !editEmail.trim() ||
                    (editName.trim() === viewUser.user.name && editEmail.trim() === viewUser.user.email)
                }
                onClick={() => void handleUpdateDetails()}
            >
                Save details
            </Button>
        </section>
    )
}
