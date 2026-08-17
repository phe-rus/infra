import { DrawerClose } from "@infra/ui/components/drawer"
import { FieldGroup } from "@infra/ui/components/field"
import { Button } from "@infra/ui/components/button"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { useState, type ReactNode } from "react"
import { z } from "zod"
import { useAddPasskey } from "@/functions/get-security"

const passkeyNameSchema = z.object({
    name: z.string().min(1, "Give this passkey a name"),
})

export function AddPasskeyDialog({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const addMutation = useAddPasskey()

    const form = useAppForm({
        defaultValues: { name: "" } as z.input<typeof passkeyNameSchema>,
        validators: { onChange: passkeyNameSchema },
        onSubmit: async ({ value }) => {
            await addMutation.mutateAsync(value.name, {
                onSuccess: () => {
                    setOpen(false)
                    form.reset()
                }
            })
        },
    })

    return (
        <>
            <Button type="button" variant="outline" className="w-fit" onClick={() => setOpen(true)}>
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
                        <DrawerClose render={<Button type="button" variant="outline" />}>Cancel</DrawerClose>
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
