import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@infra/ui/components/button"
import { Card, CardContent } from "@infra/ui/components/card"
import { Switch } from "@infra/ui/components/switch"
import { cn } from "@infra/ui/lib/utils"
import { format } from "date-fns"
import { useState } from "react"
import { currentOptions } from "@/functions/get-auth"
import { passkeysOptions, useDeletePasskey } from "@/functions/get-security"
import {
    EnableTwoFactorDialog,
    DisableTwoFactorDialog,
    RegenerateBackupCodesDialog,
    AddPasskeyDialog,
    RenamePasskeyDialog,
} from "@/features/security"
import { IconLoader2, IconPencil, IconTrash } from "@tabler/icons-react"

export const Route = createFileRoute("/_workspace/security")({
    loader: async ({ context }) => {
        await context.q.ensureQueryData(passkeysOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = useSuspenseQuery(currentOptions())
    const isTwoFactorEnabled = Boolean(data?.user?.twoFactorEnabled)

    const { data: passkeys } = useSuspenseQuery(passkeysOptions())

    const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false)
    const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false)

    const deleteMutation = useDeletePasskey()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    return (
        <article className={cn(
            'container mx-auto flex w-full flex-col',
            'gap-5 py-20 md:max-w-3xl'
        )}>
            <section className='md:max-w-md'>
                <h1>Security & sign-in</h1>
                <p className="text-sm text-muted-foreground">
                    Manage how you sign in and keep your account
                    secure
                </p>
            </section>

            <section className="flex flex-col gap-3 md:max-w-md">
                <div>
                    <div className="flex items-center gap-3">
                        <h2>Two-factor authentication</h2>
                        <Switch
                            isSelected={isTwoFactorEnabled}
                            onChange={() => setTwoFactorDialogOpen(true)}
                            aria-label="Two-factor authentication"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">Require a code from an authenticator app when signing in</p>
                </div>

                {isTwoFactorEnabled && (
                    <Card>
                        <CardContent>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-fit"
                                onClick={() => setBackupCodesDialogOpen(true)}
                            >
                                Generate new backup codes
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </section>

            {isTwoFactorEnabled ? (
                <DisableTwoFactorDialog open={twoFactorDialogOpen} onOpenChange={setTwoFactorDialogOpen} />
            ) : (
                <EnableTwoFactorDialog open={twoFactorDialogOpen} onOpenChange={setTwoFactorDialogOpen} />
            )}
            <RegenerateBackupCodesDialog open={backupCodesDialogOpen} onOpenChange={setBackupCodesDialogOpen} />

            <section className="flex flex-col gap-3 md:max-w-md">
                <div>
                    <div className="flex items-center gap-3">
                        <h2>Passkeys</h2>
                        <AddPasskeyDialog size="xs">Add</AddPasskeyDialog>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Sign in without a password, using your
                        device's biometrics or a security key
                    </p>
                </div>
                {passkeys && passkeys.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {passkeys.map((passkey) => (
                            <div key={passkey.id} className={cn(
                                "flex items-center justify-between gap-3",
                                'p-3 bg-accent rounded-md'
                            )}>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold">{passkey.name || "Passkey"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Added {format(String(passkey.createdAt), "PPP")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RenamePasskeyDialog
                                        id={passkey.id}
                                        name={passkey.name || "Passkey"}
                                        size='icon-xs'
                                        variant='secondary'
                                        className='rounded-full'
                                    >
                                        <IconPencil />
                                    </RenamePasskeyDialog>
                                    <Button
                                        type="button"
                                        variant='destructive'
                                        size="icon-xs"
                                        className='rounded-full'
                                        isDisabled={deleteMutation.isPending && deletingId === passkey.id}
                                        onClick={() => {
                                            setDeletingId(passkey.id)
                                            deleteMutation.mutate(passkey.id)
                                        }}
                                    >
                                        {deleteMutation.isPending && deletingId === passkey.id
                                            ? <IconLoader2 className='animate-spin' />
                                            : <IconTrash />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No passkeys yet</p>
                )}
            </section>
        </article>
    )
}
