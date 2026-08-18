import { useState } from "react"
import type { ComponentProps, FC, PropsWithChildren } from "react"
import { formatUtc } from "@infra/ui/lib/date"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { DrawerClose } from "@infra/ui/components/drawer"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { IconLoader2, IconPencil, IconTrash } from "@tabler/icons-react"
import { z } from "zod"
import type { PasskeysData } from "@/functions/get-security"
import { useAddPasskey, useUpdatePasskey, useDeletePasskey } from "@/functions/get-security"

type TriggerProps = Omit<ComponentProps<typeof Button>, "children" | "onClick">

type ListProps = {
    data: PasskeysData
}

type RenameProps = PropsWithChildren<{ id: string; name: string }> & TriggerProps

const passkeyNameSchema = z.object({
    name: z.string().min(1, "Give this passkey a name"),
})

const addPasskeySchema = z.object({
    name: z.string().min(1, "Give this passkey a name"),
    authenticatorAttachment: z.enum(["platform", "cross-platform"]),
})

const Rename: FC<RenameProps> = ({ id, name, children, ...props }) => {
    const [open, setOpen] = useState(false)
    const updateMutation = useUpdatePasskey()

    const form = useAppForm({
        defaultValues: { name },
        validators: { onChange: passkeyNameSchema },
        onSubmit: async ({ value }) => {
            await updateMutation.mutateAsync(
                { id: id, name: value.name },
                {
                    onSuccess: () => {
                        setOpen(false)
                    },
                }
            )
        },
    })

    return (
        <>
            <Button type="button" onClick={() => setOpen(true)} {...props}>
                {children}
            </Button>

            <DialogWidget
                open={open}
                onOpenChange={setOpen}
                title="Rename passkey"
                description="Give this passkey a name you'll recognize later"
                onSubmit={(e) => {
                    e.preventDefault()
                    void form.handleSubmit()
                }}
                footer={
                    <>
                        <Button type="submit" isDisabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Saving…" : "Save"}
                        </Button>
                        <DrawerClose render={<Button type="button" variant="outline" />}>
                            Cancel
                        </DrawerClose>
                    </>
                }
            >
                <form.AppForm>
                    <FieldGroup>
                        <form.AppField
                            name="name"
                            children={(field) => (
                                <field.input label="Name" placeholder="e.g. MacBook Touch ID" />
                            )}
                        />
                    </FieldGroup>
                </form.AppForm>
            </DialogWidget>
        </>
    )
}

const Add: FC<PropsWithChildren<TriggerProps>> = ({ children, ...props }) => {
    const [open, setOpen] = useState(false)
    const addMutation = useAddPasskey()

    const form = useAppForm({
        // widens the literal "platform" to the schema's union type
        defaultValues: { name: "", authenticatorAttachment: "platform" } as z.input<
            typeof addPasskeySchema
        >,
        validators: { onChange: addPasskeySchema },
        onSubmit: async ({ value }) => {
            await addMutation.mutateAsync(
                { name: value.name, authenticatorAttachment: value.authenticatorAttachment },
                {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    },
                }
            )
        },
    })

    return (
        <>
            <Button type="button" onClick={() => setOpen(true)} {...props}>
                {children}
            </Button>

            <DialogWidget
                open={open}
                onOpenChange={setOpen}
                title="Add a passkey"
                description="Name it so you can recognize it later, then follow your browser's prompt"
                onSubmit={(e) => {
                    e.preventDefault()
                    void form.handleSubmit()
                }}
                footer={
                    <>
                        <Button type="submit" isDisabled={addMutation.isPending}>
                            {addMutation.isPending ? "Waiting for passkey…" : "Continue"}
                        </Button>
                        <DrawerClose render={<Button type="button" variant="outline" />}>
                            Cancel
                        </DrawerClose>
                    </>
                }
            >
                <form.AppForm>
                    <FieldGroup>
                        <form.AppField
                            name="name"
                            children={(field) => (
                                <field.input label="Name" placeholder="e.g. MacBook Touch ID" />
                            )}
                        />
                        <form.AppField
                            name="authenticatorAttachment"
                            children={(field) => (
                                <field.radioCard
                                    label="Where should this passkey live?"
                                    options={[
                                        {
                                            value: "platform",
                                            label: "This device",
                                            description:
                                                "Touch ID, Windows Hello, or your synced password manager",
                                        },
                                        {
                                            value: "cross-platform",
                                            label: "A different device or security key",
                                            description:
                                                "Use this if you already have a passkey on this device",
                                        },
                                    ]}
                                />
                            )}
                        />
                    </FieldGroup>
                </form.AppForm>
            </DialogWidget>
        </>
    )
}

const List: FC<ListProps> = ({ data }) => {
    const deleteMutation = useDeletePasskey()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    if (data.length === 0) {
        return <p className="text-sm text-muted-foreground">No passkeys yet</p>
    }

    return (
        <div className="flex flex-col gap-3">
            {data.map((passkey) => (
                <div
                    key={passkey.id}
                    className={cn(
                        "flex items-center justify-between gap-3",
                        "rounded-md bg-accent p-3"
                    )}
                >
                    <div className="flex flex-col">
                        <p className="text-sm font-bold">{passkey.name || "Passkey"}</p>
                        <p className="text-xs text-muted-foreground">
                            Added {formatUtc(String(passkey.createdAt), "PPP")}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Rename
                            id={passkey.id}
                            name={passkey.name || "Passkey"}
                            size="icon-xs"
                            variant="secondary"
                            className="rounded-full"
                        >
                            <IconPencil />
                        </Rename>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon-xs"
                            className="rounded-full"
                            isDisabled={deleteMutation.isPending && deletingId === passkey.id}
                            onClick={() => {
                                setDeletingId(passkey.id)
                                deleteMutation.mutate(passkey.id)
                            }}
                        >
                            {deleteMutation.isPending && deletingId === passkey.id ? (
                                <IconLoader2 className="animate-spin" />
                            ) : (
                                <IconTrash />
                            )}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export const Passkey = { List, Add }
