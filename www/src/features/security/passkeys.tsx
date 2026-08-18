import { useState } from "react"
import type { ComponentProps, PropsWithChildren } from "react"
import { useAddPasskey, useUpdatePasskey } from "@/functions/get-security"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { DrawerClose } from "@infra/ui/components/drawer"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { Button } from "@infra/ui/components/button"
import { z } from "zod"

const passkeyNameSchema = z.object({
    name: z.string().min(1, "Give this passkey a name"),
})

const addPasskeySchema = z.object({
    name: z.string().min(1, "Give this passkey a name"),
    authenticatorAttachment: z.enum(["platform", "cross-platform"]),
})

type TriggerProps = Omit<ComponentProps<typeof Button>, "children" | "onClick">

export function RenamePasskeyDialog({
    id,
    name,
    children,
    ...props
}: PropsWithChildren<{ id: string; name: string }> & TriggerProps) {
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

export function AddPasskeyDialog({ children, ...props }: PropsWithChildren<TriggerProps>) {
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
