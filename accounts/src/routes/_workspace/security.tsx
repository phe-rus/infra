import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@infra/ui/components/button"
import { Switch } from "@infra/ui/components/switch"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { ContentView } from "@infra/ui/widgets/content-view"
import { useState } from "react"
import { currentOptions } from "@/domains/auth"
import {
    passkeysOptions,
    sessionsOptions,
    usePasskeys,
    useSessions,
    TwoFactor,
    Passkey,
    SessionList,
    DeleteAccountDialog,
} from "@/domains/security"
import { Badge } from "@infra/ui/components/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Key01Icon } from "@hugeicons/core-free-icons"

export const Route = createFileRoute("/_workspace/security")({
    loader: async ({ context }) => {
        await context.q.ensureQueryData(passkeysOptions())
        await context.q.ensureQueryData(sessionsOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = useSuspenseQuery(currentOptions())
    const { data: passkeys } = usePasskeys()
    const { data: sessions } = useSessions()
    const isTwoFactorEnabled = Boolean(data?.user.twoFactorEnabled)

    const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false)
    const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false)
    const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false)

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Security & sign-in"
                    description="Manage how you sign in and keep your account secure"
                />
            }
        >
            <ContentView.Section className="md:max-w-md">
                <ContentView.Row className="w-full justify-between rounded-md! bg-input/35 px-3 py-2">
                    <div className="flex gap-3">
                        <Button size="icon-sm" variant="secondary" className="rounded-full">
                            <HugeiconsIcon icon={Key01Icon} />
                        </Button>
                        <div className="gap-0!">
                            <h2 className="text-base">Two-factor authentication</h2>
                            <p className="text-xs text-muted-foreground md:max-w-64!">
                                Require a code from an authenticator app when signing in
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={isTwoFactorEnabled}
                        onCheckedChange={() => setTwoFactorDialogOpen(true)}
                        aria-label="Two-factor authentication"
                    />
                </ContentView.Row>
                {!isTwoFactorEnabled && (
                    <Badge
                        variant="secondary"
                        className="w-fit cursor-pointer rounded-full"
                        onClick={() => setBackupCodesDialogOpen(true)}
                    >
                        Backup codes
                    </Badge>
                )}
            </ContentView.Section>

            {isTwoFactorEnabled ? (
                <TwoFactor.Disable
                    open={twoFactorDialogOpen}
                    onOpenChange={setTwoFactorDialogOpen}
                />
            ) : (
                <TwoFactor.Enable
                    open={twoFactorDialogOpen}
                    onOpenChange={setTwoFactorDialogOpen}
                />
            )}
            <TwoFactor.RegenerateBackupCodes
                open={backupCodesDialogOpen}
                onOpenChange={setBackupCodesDialogOpen}
            />

            <ContentView.Section className="md:max-w-md">
                <ContentView.Header
                    as="h2"
                    heading="Passkeys"
                    action={<Passkey.Add size="xs">Add</Passkey.Add>}
                    p="Sign in without a password, using your device's biometrics or a security key"
                    pClassName="text-sm text-muted-foreground"
                />
                <Passkey.List data={passkeys} />
            </ContentView.Section>

            <ContentView.Section className="md:max-w-md">
                <ContentView.Header
                    as="h2"
                    heading="Sessions & devices"
                    p="Everywhere you're currently signed in. Sign out of any device that isn't yours."
                    pClassName="text-sm text-muted-foreground"
                />
                {sessions === null ? (
                    <p className="text-sm text-muted-foreground">
                        For your security, viewing sessions requires a recent sign-in. Sign
                        out and back in to manage your devices here.
                    </p>
                ) : (
                    <SessionList data={sessions} currentSessionToken={data?.session.token} />
                )}
            </ContentView.Section>

            <ContentView.Section className="md:max-w-md">
                <ContentView.Header
                    as="h2"
                    heading="Danger zone"
                    p="Permanently delete your account and all its data. This can't be undone."
                    pClassName="text-sm text-muted-foreground"
                />
                <Button
                    type="button"
                    variant="destructive"
                    className="w-fit"
                    onClick={() => setDeleteAccountDialogOpen(true)}
                >
                    Terminate account permanently
                </Button>
            </ContentView.Section>

            <DeleteAccountDialog
                open={deleteAccountDialogOpen}
                onOpenChange={setDeleteAccountDialogOpen}
            />
        </ViewController>
    )
}
