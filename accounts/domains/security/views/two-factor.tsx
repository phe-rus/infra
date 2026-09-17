import type { FC } from "react"
import { DrawerClose } from "@infra/ui/components/drawer"
import { FieldGroup } from "@infra/ui/components/field"
import { Button } from "@infra/ui/components/button"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { QRCodeSVG } from "qrcode.react"
import { z } from "zod"
import {
    useEnableTwoFactor,
    useVerifyTwoFactor,
    useDisableTwoFactor,
    useGenerateBackupCodes,
} from "@/domains/security"
import { m } from "@/src/paraglide/messages"

type ControlledDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

function getPasswordSchema() {
    return z.object({
        password: z
            .string()
            .min(
                1,
                m["security.twoFactor.passwordRequired"]()
            ),
    })
}

function getTotpCodeSchema() {
    return z.object({
        code: z
            .string()
            .min(1, m["security.twoFactor.codeRequired"]()),
    })
}

const Enable: FC<ControlledDialogProps> = ({
    open,
    onOpenChange,
}) => {
    const passwordSchema = getPasswordSchema()
    const totpCodeSchema = getTotpCodeSchema()
    const enableMutation = useEnableTwoFactor()
    // this flow never passes `method: "otp"`, so a resolved enrollment is
    // always the "totp" variant carrying totpURI/backupCodes — narrow here
    // rather than at every read site
    const enrollment =
        enableMutation.data?.method === "totp"
            ? enableMutation.data
            : null

    const close = () => {
        onOpenChange(false)
        enableMutation.reset()
        passwordForm.reset()
        codeForm.reset()
    }

    const passwordForm = useAppForm({
        defaultValues: { password: "" },
        validators: { onChange: passwordSchema },
        onSubmit: async ({ value }) => {
            await enableMutation.mutateAsync(value.password)
        },
    })

    const verifyMutation = useVerifyTwoFactor()

    const codeForm = useAppForm({
        defaultValues: { code: "" },
        validators: { onChange: totpCodeSchema },
        onSubmit: async ({ value }) => {
            await verifyMutation.mutateAsync(value.code, {
                onSuccess: () => {
                    close()
                },
            })
        },
    })

    return (
        <>
            {!enrollment ? (
                <DialogWidget
                    open={open}
                    onOpenChange={(next) => {
                        if (!next) close()
                    }}
                    title={m[
                        "security.twoFactor.enableTitle"
                    ]()}
                    description={m[
                        "security.twoFactor.enableDescription"
                    ]()}
                    onSubmit={(e) => {
                        e.preventDefault()
                        void passwordForm.handleSubmit()
                    }}
                    footer={
                        <>
                            <Button
                                type="submit"
                                disabled={
                                    enableMutation.isPending
                                }
                            >
                                {enableMutation.isPending
                                    ? m[
                                          "security.twoFactor.continuing"
                                      ]()
                                    : m[
                                          "security.twoFactor.continueLabel"
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
                                {m[
                                    "security.twoFactor.cancel"
                                ]()}
                            </DrawerClose>
                        </>
                    }
                >
                    <passwordForm.AppForm>
                        <FieldGroup>
                            <passwordForm.AppField
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
                    </passwordForm.AppForm>
                </DialogWidget>
            ) : (
                <DialogWidget
                    open={open}
                    onOpenChange={(next) => {
                        if (!next) close()
                    }}
                    title={m[
                        "security.twoFactor.scanTitle"
                    ]()}
                    description={m[
                        "security.twoFactor.scanDescription"
                    ]()}
                    onSubmit={(e) => {
                        e.preventDefault()
                        void codeForm.handleSubmit()
                    }}
                    footer={
                        <>
                            <Button
                                type="submit"
                                disabled={
                                    verifyMutation.isPending
                                }
                            >
                                {verifyMutation.isPending
                                    ? m[
                                          "security.twoFactor.verifying"
                                      ]()
                                    : m[
                                          "security.twoFactor.verifyAndEnable"
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
                                {m[
                                    "security.twoFactor.cancel"
                                ]()}
                            </DrawerClose>
                        </>
                    }
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-center rounded-none bg-white p-4">
                            <QRCodeSVG
                                value={enrollment.totpURI}
                                size={180}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium">
                                {m["security.backupCodes"]()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {m[
                                    "security.twoFactor.backupCodesSaveWarning"
                                ]()}
                            </p>
                            <div className="grid grid-cols-2 gap-1 font-mono text-xs">
                                {enrollment.backupCodes.map(
                                    (code) => (
                                        <span
                                            key={code}
                                            className="bg-muted px-2 py-1"
                                        >
                                            {code}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>

                        <codeForm.AppForm>
                            <FieldGroup>
                                <codeForm.AppField
                                    name="code"
                                    children={(field) => (
                                        <field.otp
                                            label={m[
                                                "auth.twoFactor.codeLabel"
                                            ]()}
                                            onComplete={() =>
                                                void codeForm.handleSubmit()
                                            }
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

const Disable: FC<ControlledDialogProps> = ({
    open,
    onOpenChange,
}) => {
    const passwordSchema = getPasswordSchema()
    const disableMutation = useDisableTwoFactor()

    const form = useAppForm({
        defaultValues: { password: "" },
        validators: { onChange: passwordSchema },
        onSubmit: async ({ value }) => {
            await disableMutation.mutateAsync(
                value.password,
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        form.reset()
                    },
                }
            )
        },
    })

    return (
        <DialogWidget
            open={open}
            onOpenChange={onOpenChange}
            title={m["security.twoFactor.disableTitle"]()}
            description={m[
                "security.twoFactor.disableDescription"
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
                        disabled={disableMutation.isPending}
                    >
                        {disableMutation.isPending
                            ? m[
                                  "security.twoFactor.disabling"
                              ]()
                            : m[
                                  "security.twoFactor.disable"
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

const RegenerateBackupCodes: FC<ControlledDialogProps> = ({
    open,
    onOpenChange,
}) => {
    const passwordSchema = getPasswordSchema()
    const generateMutation = useGenerateBackupCodes()
    const backupCodes =
        generateMutation.data?.backupCodes ?? null

    const close = () => {
        onOpenChange(false)
        generateMutation.reset()
        form.reset()
    }

    const form = useAppForm({
        defaultValues: { password: "" },
        validators: { onChange: passwordSchema },
        onSubmit: async ({ value }) => {
            await generateMutation.mutateAsync(value.password)
        },
    })

    return (
        <DialogWidget
            open={open}
            onOpenChange={(next) => {
                if (!next) close()
            }}
            title={m["security.twoFactor.regenerateTitle"]()}
            description={
                backupCodes
                    ? m[
                          "security.twoFactor.regenerateSavedDescription"
                      ]()
                    : m[
                          "security.twoFactor.regenerateConfirmDescription"
                      ]()
            }
            onSubmit={(e) => {
                e.preventDefault()
                if (!backupCodes) void form.handleSubmit()
            }}
            footer={
                backupCodes ? (
                    <Button type="button" onClick={close}>
                        {m["security.twoFactor.done"]()}
                    </Button>
                ) : (
                    <>
                        <Button
                            type="submit"
                            disabled={
                                generateMutation.isPending
                            }
                        >
                            {generateMutation.isPending
                                ? m[
                                      "security.twoFactor.generating"
                                  ]()
                                : m[
                                      "security.twoFactor.generateCodes"
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
                )
            }
        >
            {!backupCodes ? (
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
            ) : (
                <div className="grid grid-cols-2 gap-1 font-mono text-xs">
                    {backupCodes.map((code) => (
                        <span
                            key={code}
                            className="bg-muted px-2 py-1"
                        >
                            {code}
                        </span>
                    ))}
                </div>
            )}
        </DialogWidget>
    )
}

export const TwoFactor = {
    Enable,
    Disable,
    RegenerateBackupCodes,
}
