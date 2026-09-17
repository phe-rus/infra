import { DrawerClose } from "@infra/ui/components/drawer"
import { FieldGroup } from "@infra/ui/components/field"
import { Button } from "@infra/ui/components/button"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { z } from "zod"
import { useDeleteAccount } from "@/domains/auth"
import { m } from "@/src/paraglide/messages"

type ControlledDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteAccountDialog({
    open,
    onOpenChange,
}: ControlledDialogProps) {
    const passwordSchema = z.object({
        password: z
            .string()
            .min(
                1,
                m["security.twoFactor.passwordRequired"]()
            ),
    })
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
            await deleteMutation
                .mutateAsync(value.password, {
                    onSuccess: close,
                })
                .catch(() => null)
        },
    })

    return (
        <DialogWidget
            open={open}
            onOpenChange={(next) => {
                if (!next) close()
            }}
            title={m["security.terminateAccount"]()}
            description={m[
                "security.deleteAccount.description"
            ]()}
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            footer={
                <>
                    <Button
                        type="submit"
                        variant="destructive"
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending
                            ? m[
                                  "security.deleteAccount.sending"
                              ]()
                            : m[
                                  "security.deleteAccount.sendConfirmation"
                              ]()}
                    </Button>
                    <DrawerClose
                        render={
                            <Button
                                type="button"
                                variant="outline"
                            />
                        }
                    >
                        {m["security.twoFactor.cancel"]()}
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
                                label={m[
                                    "auth.common.password.label"
                                ]()}
                                type="password"
                                autoComplete="current-password"
                                placeholder={m[
                                    "auth.signIn.passwordPlaceholder"
                                ]()}
                            />
                        )}
                    />
                </FieldGroup>
            </form.AppForm>
        </DialogWidget>
    )
}
