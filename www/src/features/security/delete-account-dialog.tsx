import { DrawerClose } from "@infra/ui/components/drawer"
import { FieldGroup } from "@infra/ui/components/field"
import { Button } from "@infra/ui/components/button"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { z } from "zod"
import { useDeleteAccount } from "@/functions/get-auth"

const passwordSchema = z.object({
    password: z.string().min(1, "Password is required"),
})

type ControlledDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteAccountDialog({ open, onOpenChange }: ControlledDialogProps) {
    const deleteMutation = useDeleteAccount()

    function close() {
        onOpenChange(false)
        deleteMutation.reset()
        form.reset()
    }

    const form = useAppForm({
        defaultValues: { password: "" },
        validators: { onChange: passwordSchema },
        onSubmit: async ({ value }) => {
            await deleteMutation.mutateAsync(value.password, { onSuccess: close }).catch(() => null)
        },
    })

    return (
        <DialogWidget
            open={open}
            onOpenChange={(next) => {
                if (!next) close()
            }}
            title="Terminate account permanently"
            description="Confirm your password to send a confirmation link to your email. Your account and all its data are deleted once you click it — this can't be undone."
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            footer={
                <>
                    <Button
                        type="submit"
                        variant="destructive"
                        isDisabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? "Sending…" : "Send confirmation email"}
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
                        name="password"
                        children={(field) => (
                            <field.input
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                            />
                        )}
                    />
                </FieldGroup>
            </form.AppForm>
        </DialogWidget>
    )
}
