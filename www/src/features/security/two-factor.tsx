import { DrawerClose } from "@infra/ui/components/drawer"
import { FieldGroup } from "@infra/ui/components/field"
import { Button } from "@infra/ui/components/button"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { QRCodeSVG } from "qrcode.react"
import { useState, type ReactNode } from "react"
import { z } from "zod"
import { useEnableTwoFactor, useVerifyTwoFactor, useDisableTwoFactor } from "@/functions/get-security"

const passwordSchema = z.object({
    password: z.string().min(1, "Password is required"),
})

const totpCodeSchema = z.object({
    code: z.string().min(1, "Enter the code"),
})

export function EnableTwoFactorDialog({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const enableMutation = useEnableTwoFactor()
    const enrollment = enableMutation.data ?? null

    function close() {
        setOpen(false)
        enableMutation.reset()
        passwordForm.reset()
        codeForm.reset()
    }

    const passwordForm = useAppForm({
        defaultValues: { password: "" } as z.input<typeof passwordSchema>,
        validators: { onChange: passwordSchema },
        onSubmit: async ({ value }) => {
            await enableMutation.mutateAsync(value.password)
        },
    })

    const verifyMutation = useVerifyTwoFactor()

    const codeForm = useAppForm({
        defaultValues: { code: "" } as z.input<typeof totpCodeSchema>,
        validators: { onChange: totpCodeSchema },
        onSubmit: async ({ value }) => {
            await verifyMutation.mutateAsync(value.code, {
                onSuccess: () => {
                    close()
                }
            })
        },
    })

    return (
        <>
            <Button type="button" variant="outline" className="w-fit" onClick={() => setOpen(true)}>
                {children}
            </Button>

            {!enrollment ? (
                <DialogWidget
                    open={open}
                    onOpenChange={(next) => { if (!next) close() }}
                    title="Enable two-factor authentication"
                    description="Confirm your password to start setup"
                    onSubmit={(e) => {
                        e.preventDefault()
                        void passwordForm.handleSubmit()
                    }}
                    footer={
                        <>
                            <Button type="submit" isDisabled={enableMutation.isPending}>
                                {enableMutation.isPending ? "Continuing…" : "Continue"}
                            </Button>
                            <DrawerClose render={<Button type="button" variant="outline" />}>Cancel</DrawerClose>
                        </>
                    }
                >
                    <passwordForm.AppForm>
                        <FieldGroup>
                            <passwordForm.AppField
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
                    </passwordForm.AppForm>
                </DialogWidget>
            ) : (
                <DialogWidget
                    open={open}
                    onOpenChange={(next) => { if (!next) close() }}
                    title="Scan the QR code"
                    description="Scan with your authenticator app, then enter the 6-digit code"
                    onSubmit={(e) => {
                        e.preventDefault()
                        void codeForm.handleSubmit()
                    }}
                    footer={
                        <>
                            <Button type="submit" isDisabled={verifyMutation.isPending}>
                                {verifyMutation.isPending ? "Verifying…" : "Verify and enable"}
                            </Button>
                            <DrawerClose render={<Button type="button" variant="outline" />}>Cancel</DrawerClose>
                        </>
                    }
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-center rounded-none bg-white p-4">
                            <QRCodeSVG value={enrollment.totpURI} size={180} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium">Backup codes</p>
                            <p className="text-xs text-muted-foreground">
                                Save these somewhere safe — each one can replace a code from your app if you lose access to it.
                            </p>
                            <div className="grid grid-cols-2 gap-1 font-mono text-xs">
                                {enrollment.backupCodes.map((code) => (
                                    <span key={code} className="bg-muted px-2 py-1">{code}</span>
                                ))}
                            </div>
                        </div>

                        <codeForm.AppForm>
                            <FieldGroup>
                                <codeForm.AppField
                                    name="code"
                                    children={(field) => (
                                        <field.input
                                            label="Code"
                                            autoComplete="one-time-code"
                                            placeholder="123456"
                                        />
                                    )}
                                />
                            </FieldGroup>
                        </codeForm.AppForm>
                    </div>
                </DialogWidget>
            )}
        </>
    )
}

export function DisableTwoFactorDialog({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const disableMutation = useDisableTwoFactor()

    const form = useAppForm({
        defaultValues: { password: "" } as z.input<typeof passwordSchema>,
        validators: { onChange: passwordSchema },
        onSubmit: async ({ value }) => {
            await disableMutation.mutateAsync(value.password, {
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
                title="Disable two-factor authentication"
                description="Confirm your password to turn off two-factor authentication"
                onSubmit={(e) => {
                    e.preventDefault()
                    void form.handleSubmit()
                }}
                footer={
                    <>
                        <Button type="submit" variant="destructive" isDisabled={disableMutation.isPending}>
                            {disableMutation.isPending ? "Disabling…" : "Disable"}
                        </Button>
                        <DrawerClose render={<Button type="button" variant="outline" />}>Cancel</DrawerClose>
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
        </>
    )
}
