import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@infra/ui/components/button"
import { Switch } from "@infra/ui/components/switch"
import { cn } from "@infra/ui/lib/utils"
import { useState } from "react"
import { currentOptions } from "@/functions/get-auth"
import { passkeysOptions } from "@/functions/get-security"
import { sessionsOptions } from "@/functions/get-sessions"
import { Badge } from "@infra/ui/components/badge"
import {
    EnableTwoFactorDialog,
    DisableTwoFactorDialog,
    RegenerateBackupCodesDialog,
    AddPasskeyDialog,
    PasskeyList,
    SessionList,
    DeleteAccountDialog,
} from "@/features/security"
import { IconKeyFilled } from "@tabler/icons-react"

export const Route = createFileRoute("/_workspace/security")({
    loader: async ({ context }) => {
        await context.q.ensureQueryData(passkeysOptions())
        await context.q.ensureQueryData(sessionsOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = useSuspenseQuery(currentOptions())
    const isTwoFactorEnabled = Boolean(data?.user.twoFactorEnabled)

    const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false)
    const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false)
    const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false)

    return (
        <article
            className={cn("container mx-auto flex w-full flex-col", "gap-5 py-20 md:max-w-3xl")}
        >
            <section className="md:max-w-md">
                <h1>Security & sign-in</h1>
                <p className="text-sm text-muted-foreground">
                    Manage how you sign in and keep your account secure
                </p>
            </section>

            <section className="flex flex-col gap-3 md:max-w-md">
                <article
                    className={cn(
                        "flex w-full justify-between rounded-md!",
                        "bg-input/35 px-3 py-2"
                    )}
                >
                    <div className="flex gap-3">
                        <Button size="icon-sm" variant="secondary" className="rounded-full">
                            <IconKeyFilled />
                        </Button>
                        <div className="gap-0!">
                            <h2 className="text-base">Two-factor authentication</h2>
                            <p className="text-xs text-muted-foreground md:max-w-64!">
                                Require a code from an authenticator app when signing in
                            </p>
                        </div>
                    </div>
                    <Switch
                        isSelected={isTwoFactorEnabled}
                        onChange={() => setTwoFactorDialogOpen(true)}
                        aria-label="Two-factor authentication"
                    />
                </article>
                {!isTwoFactorEnabled && (
                    <Badge
                        variant="secondary"
                        className="w-fit cursor-pointer rounded-full"
                        onClick={() => setBackupCodesDialogOpen(true)}
                    >
                        Backup codes
                    </Badge>
                )}
            </section>

            {isTwoFactorEnabled ? (
                <DisableTwoFactorDialog
                    open={twoFactorDialogOpen}
                    onOpenChange={setTwoFactorDialogOpen}
                />
            ) : (
                <EnableTwoFactorDialog
                    open={twoFactorDialogOpen}
                    onOpenChange={setTwoFactorDialogOpen}
                />
            )}
            <RegenerateBackupCodesDialog
                open={backupCodesDialogOpen}
                onOpenChange={setBackupCodesDialogOpen}
            />

            <section className="flex flex-col gap-3 md:max-w-md">
                <div>
                    <div className="flex items-center gap-3">
                        <h2>Passkeys</h2>
                        <AddPasskeyDialog size="xs">Add</AddPasskeyDialog>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Sign in without a password, using your device's biometrics or a security key
                    </p>
                </div>
                <PasskeyList />
            </section>

            <section className="flex flex-col gap-3 md:max-w-md">
                <div>
                    <h2>Sessions & devices</h2>
                    <p className="text-sm text-muted-foreground">
                        Everywhere you're currently signed in. Sign out of any device that isn't
                        yours.
                    </p>
                </div>
                <SessionList />
            </section>

            <section className="flex flex-col gap-3 md:max-w-md">
                <div>
                    <h2>Danger zone</h2>
                    <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all its data. This can't be undone.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="destructive"
                    className="w-fit"
                    onClick={() => setDeleteAccountDialogOpen(true)}
                >
                    Terminate account permanently
                </Button>
            </section>

            <DeleteAccountDialog
                open={deleteAccountDialogOpen}
                onOpenChange={setDeleteAccountDialogOpen}
            />
        </article>
    )
}
