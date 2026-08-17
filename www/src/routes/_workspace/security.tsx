import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@infra/ui/components/button"
import { Switch } from "@infra/ui/components/switch"
import { cn } from "@infra/ui/lib/utils"
import { format } from "date-fns"
import { useState } from "react"
import { currentOptions } from "@/functions/get-auth"
import { passkeysOptions, useDeletePasskey } from "@/functions/get-security"
import { sessionsOptions, useSessions } from "@/functions/get-sessions"
import { useRevokeSession } from "@/functions/use-sessions"
import { Badge } from "@infra/ui/components/badge"
import {
    EnableTwoFactorDialog,
    DisableTwoFactorDialog,
    RegenerateBackupCodesDialog,
    AddPasskeyDialog,
    RenamePasskeyDialog,
} from "@/features/security"
import { IconKeyFilled, IconLoader2, IconPencil, IconTrash } from "@tabler/icons-react"
import { UAParser } from "ua-parser-js"

function describeDevice(userAgent: string | null | undefined) {
    const { browser, os } = new UAParser(userAgent ?? "").getResult()
    return `${browser.name ?? "A browser"} on ${os.name ?? "an unknown OS"}`
}

export const Route = createFileRoute("/_workspace/security")({
    loader: async ({ context }) => {
        await context.q.ensureQueryData(passkeysOptions())
        await context.q.ensureQueryData(sessionsOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = useSuspenseQuery(currentOptions())
    const isTwoFactorEnabled = Boolean(data?.user?.twoFactorEnabled)

    const { data: passkeys } = useSuspenseQuery(passkeysOptions())
    const { data: sessions } = useSessions()
    const currentSessionToken = data?.session?.token

    const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false)
    const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false)

    const deleteMutation = useDeletePasskey()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const revokeMutation = useRevokeSession()
    const [revokingToken, setRevokingToken] = useState<string | null>(null)

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
                {passkeys && passkeys.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {passkeys.map((passkey) => (
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
                                        Added {format(String(passkey.createdAt), "PPP")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RenamePasskeyDialog
                                        id={passkey.id}
                                        name={passkey.name || "Passkey"}
                                        size="icon-xs"
                                        variant="secondary"
                                        className="rounded-full"
                                    >
                                        <IconPencil />
                                    </RenamePasskeyDialog>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon-xs"
                                        className="rounded-full"
                                        isDisabled={
                                            deleteMutation.isPending && deletingId === passkey.id
                                        }
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
                ) : (
                    <p className="text-sm text-muted-foreground">No passkeys yet</p>
                )}
            </section>

            <section className="flex flex-col gap-3 md:max-w-md">
                <div>
                    <h2>Sessions & devices</h2>
                    <p className="text-sm text-muted-foreground">
                        Everywhere you're currently signed in. Sign out of any device that isn't
                        yours.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    {sessions?.map((session) => {
                        const isCurrent = session.token === currentSessionToken
                        return (
                            <div
                                key={session.id}
                                className={cn(
                                    "flex items-center justify-between gap-3",
                                    "rounded-md bg-accent p-3"
                                )}
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold">
                                            {describeDevice(session.userAgent)}
                                        </p>
                                        {isCurrent && (
                                            <Badge variant="secondary" className="rounded-full">
                                                This device
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {session.ipAddress ?? "Unknown location"} · Signed in{" "}
                                        {format(String(session.createdAt), "PPP")}
                                    </p>
                                </div>
                                {!isCurrent && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon-xs"
                                        className="rounded-full"
                                        aria-label="Sign out this device"
                                        isDisabled={
                                            revokeMutation.isPending &&
                                            revokingToken === session.token
                                        }
                                        onClick={() => {
                                            setRevokingToken(session.token)
                                            revokeMutation.mutate(session.token)
                                        }}
                                    >
                                        {revokeMutation.isPending &&
                                        revokingToken === session.token ? (
                                            <IconLoader2 className="animate-spin" />
                                        ) : (
                                            <IconTrash />
                                        )}
                                    </Button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </section>
        </article>
    )
}
