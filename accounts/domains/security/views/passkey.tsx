import { useState } from "react"
import type {
    ComponentProps,
    FC,
    PropsWithChildren,
} from "react"
import { formatUtc } from "@infra/ui/lib/date"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { DrawerClose } from "@infra/ui/components/drawer"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Delete02Icon,
    Loading03Icon,
    PencilIcon,
} from "@hugeicons/core-free-icons"
import { z } from "zod"
import type { PasskeysData } from "@/domains/security"
import {
    useAddPasskey,
    useUpdatePasskey,
    useDeletePasskey,
} from "@/domains/security"
import { m } from "@/src/paraglide/messages"

type TriggerProps = Omit<
    ComponentProps<typeof Button>,
    "children" | "onClick"
>

type ListProps = {
    data: PasskeysData
}

type RenameProps = PropsWithChildren<{
    id: string
    name: string
}> &
    TriggerProps

function getPasskeyNameSchema() {
    return z.object({
        name: z
            .string()
            .min(1, m["security.passkey.nameRequired"]()),
    })
}

function getAddPasskeySchema() {
    return z.object({
        name: z
            .string()
            .min(1, m["security.passkey.nameRequired"]()),
        authenticatorAttachment: z.enum([
            "platform",
            "cross-platform",
        ]),
    })
}

const Rename: FC<RenameProps> = ({
    id,
    name,
    children,
    ...props
}) => {
    const passkeyNameSchema = getPasskeyNameSchema()
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
            <Button
                type="button"
                onClick={() => setOpen(true)}
                {...props}
            >
                {children}
            </Button>

            <DialogWidget
                open={open}
                onOpenChange={setOpen}
                title={m["security.passkey.renameTitle"]()}
                description={m[
                    "security.passkey.renameDescription"
                ]()}
                onSubmit={(e) => {
                    e.preventDefault()
                    void form.handleSubmit()
                }}
                footer={
                    <>
                        <Button
                            type="submit"
                            disabled={
                                updateMutation.isPending
                            }
                        >
                            {updateMutation.isPending
                                ? m[
                                      "security.passkey.saving"
                                  ]()
                                : m[
                                      "security.passkey.save"
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
                            name="name"
                            children={(field) => (
                                <field.input
                                    label={m[
                                        "auth.createAccount.nameLabel"
                                    ]()}
                                    placeholder={m[
                                        "security.passkey.namePlaceholder"
                                    ]()}
                                />
                            )}
                        />
                    </FieldGroup>
                </form.AppForm>
            </DialogWidget>
        </>
    )
}

const Add: FC<PropsWithChildren<TriggerProps>> = ({
    children,
    ...props
}) => {
    const addPasskeySchema = getAddPasskeySchema()
    const [open, setOpen] = useState(false)
    const addMutation = useAddPasskey()

    const form = useAppForm({
        // widens the literal "platform" to the schema's union type
        defaultValues: {
            name: "",
            authenticatorAttachment: "platform",
        } as z.input<typeof addPasskeySchema>,
        validators: { onChange: addPasskeySchema },
        onSubmit: async ({ value }) => {
            await addMutation.mutateAsync(
                {
                    name: value.name,
                    authenticatorAttachment:
                        value.authenticatorAttachment,
                },
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
            <Button
                type="button"
                onClick={() => setOpen(true)}
                {...props}
            >
                {children}
            </Button>

            <DialogWidget
                open={open}
                onOpenChange={setOpen}
                title={m["security.passkey.addTitle"]()}
                description={m[
                    "security.passkey.addDescription"
                ]()}
                onSubmit={(e) => {
                    e.preventDefault()
                    void form.handleSubmit()
                }}
                footer={
                    <>
                        <Button
                            type="submit"
                            disabled={addMutation.isPending}
                        >
                            {addMutation.isPending
                                ? m[
                                      "auth.signIn.passkeyWaiting"
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
                            {m["security.twoFactor.cancel"]()}
                        </DrawerClose>
                    </>
                }
            >
                <form.AppForm>
                    <FieldGroup>
                        <form.AppField
                            name="name"
                            children={(field) => (
                                <field.input
                                    label={m[
                                        "auth.createAccount.nameLabel"
                                    ]()}
                                    placeholder={m[
                                        "security.passkey.namePlaceholder"
                                    ]()}
                                />
                            )}
                        />
                        <form.AppField
                            name="authenticatorAttachment"
                            children={(field) => (
                                <field.radioCard
                                    label={m[
                                        "security.passkey.whereLiveLabel"
                                    ]()}
                                    options={[
                                        {
                                            value: "platform",
                                            label: m[
                                                "security.passkey.thisDeviceLabel"
                                            ](),
                                            description:
                                                m[
                                                    "security.passkey.thisDeviceDescription"
                                                ](),
                                        },
                                        {
                                            value: "cross-platform",
                                            label: m[
                                                "security.passkey.otherDeviceLabel"
                                            ](),
                                            description:
                                                m[
                                                    "security.passkey.otherDeviceDescription"
                                                ](),
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
    const [deletingId, setDeletingId] = useState<
        string | null
    >(null)

    if (data.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                {m["security.passkey.empty"]()}
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {[...data]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                )
                .map((passkey) => (
                    <div
                        key={passkey.id}
                        className={cn(
                            "flex items-center justify-between gap-3",
                            "rounded-md bg-accent p-3"
                        )}
                    >
                        <div className="flex flex-col">
                            <p className="text-sm font-bold">
                                {passkey.name ||
                                    m[
                                        "security.passkey.fallbackName"
                                    ]()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {m[
                                    "security.passkey.added"
                                ]()}
                                {formatUtc(
                                    String(passkey.createdAt),
                                    "PPP"
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Rename
                                id={passkey.id}
                                name={
                                    passkey.name ||
                                    m[
                                        "security.passkey.fallbackName"
                                    ]()
                                }
                                size="icon-xs"
                                variant="secondary"
                                className="rounded-full"
                            >
                                <HugeiconsIcon
                                    icon={PencilIcon}
                                />
                            </Rename>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon-xs"
                                className="rounded-full"
                                disabled={
                                    deleteMutation.isPending &&
                                    deletingId === passkey.id
                                }
                                onClick={() => {
                                    setDeletingId(passkey.id)
                                    deleteMutation.mutate(
                                        passkey.id
                                    )
                                }}
                            >
                                {deleteMutation.isPending &&
                                deletingId === passkey.id ? (
                                    <HugeiconsIcon
                                        icon={Loading03Icon}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <HugeiconsIcon
                                        icon={Delete02Icon}
                                    />
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
        </div>
    )
}

export const Passkey = { List, Add }
