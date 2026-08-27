import { useEffect, useRef, useState } from "react"
import type { FC } from "react"
import { Field, FieldLabel } from "@infra/ui/components/field"
import { Input } from "@infra/ui/components/input"
import { Button } from "@infra/ui/components/button"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@infra/ui/components/avatar"
import {
    useUpdateUserDetails,
    useUploadOwnAvatar,
    useUploadUserImage,
} from "@/domains/users"
import type { UserDetail } from "@/domains/users"

export type UpdateUserProps = {
    viewUser: UserDetail
    currentUserId: string
}

export const UpdateUser: FC<UpdateUserProps> = ({
    viewUser,
    currentUserId,
}) => {
    const isSelf = viewUser.user.id === currentUserId
    const { mutateAsync: updateUserDetails } = useUpdateUserDetails()
    const { mutateAsync: uploadUserImage, isPending: isUploadingOther } =
        useUploadUserImage()
    const { mutateAsync: uploadOwnAvatar, isPending: isUploadingOwn } =
        useUploadOwnAvatar()
    const isUploadingImage = isSelf ? isUploadingOwn : isUploadingOther
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [editName, setEditName] = useState(viewUser.user.name)
    const [editEmail, setEditEmail] = useState(viewUser.user.email)

    useEffect(() => {
        setEditName(viewUser.user.name)
        setEditEmail(viewUser.user.email)
    }, [viewUser.user.name, viewUser.user.email])

    async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        e.target.value = ""
        if (!file) return
        if (isSelf) {
            await uploadOwnAvatar(file)
            return
        }
        const formData = new FormData()
        formData.set("file", file)
        formData.set("userId", viewUser.user.id)
        await uploadUserImage(formData)
    }

    async function handleUpdateDetails() {
        const name = editName.trim()
        const email = editEmail.trim()
        await updateUserDetails({
            userId: viewUser.user.id,
            ...(name !== viewUser.user.name && { name }),
            ...(email !== viewUser.user.email && { email }),
        })
    }

    return (
        <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Details</h3>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() =>
                        isSelf && fileInputRef.current?.click()
                    }
                    disabled={isUploadingImage || !isSelf}
                    className={isSelf ? "cursor-pointer disabled:opacity-50" : ""}
                >
                    <Avatar size="lg">
                        <AvatarImage
                            src={viewUser.user.image ?? undefined}
                            alt={viewUser.user.name}
                        />
                        <AvatarFallback>
                            {viewUser.user.name.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </button>
                {isSelf && (
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void handleImageSelected(e)}
                    />
                )}
                {isSelf && (
                    <span className="text-xs text-muted-foreground">
                        {isUploadingImage
                            ? "Uploading…"
                            : "Click to change image"}
                    </span>
                )}
            </div>
            <Field>
                <FieldLabel htmlFor="edit-user-name">Name</FieldLabel>
                <Input
                    id="edit-user-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                />
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
                    (editName.trim() === viewUser.user.name &&
                        editEmail.trim() === viewUser.user.email)
                }
                onClick={() => void handleUpdateDetails()}
            >
                Save details
            </Button>
        </section>
    )
}
