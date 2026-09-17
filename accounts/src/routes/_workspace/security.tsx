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
import { m } from "../../paraglide/messages"

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
    const isTwoFactorEnabled = Boolean(
        data?.user.twoFactorEnabled
    )

    const [twoFactorDialogOpen, setTwoFactorDialogOpen] =
        useState(false)
    const [backupCodesDialogOpen, setBackupCodesDialogOpen] =
        useState(false)
    const [
        deleteAccountDialogOpen,
        setDeleteAccountDialogOpen,
    ] = useState(false)

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title={m["security.title"]()}
                    description={m["security.description"]()}
                />
            }
        >
            <ContentView.Section className="md:max-w-md">
                <ContentView.Row className="w-full justify-between rounded-md! bg-input/35 px-3 py-2">
                    <div className="flex gap-3">
                        <Button
                            size="icon-sm"
                            variant="secondary"
                            className="rounded-full"
                        >
                            <HugeiconsIcon icon={Key01Icon} />
                        </Button>
                        <div className="gap-0!">
                            <h2 className="text-base">
                                {m[
                                    "security.twoFactorHeading"
                                ]()}
                            </h2>
                            <p className="text-xs text-muted-foreground md:max-w-64!">
                                {m[
                                    "security.twoFactorDescription"
                                ]()}
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={isTwoFactorEnabled}
                        onCheckedChange={() =>
                            setTwoFactorDialogOpen(true)
                        }
                        aria-label={m[
                            "security.twoFactorHeading"
                        ]()}
                    />
                </ContentView.Row>
                {!isTwoFactorEnabled && (
                    <Badge
                        variant="secondary"
                        className="w-fit cursor-pointer rounded-full"
                        onClick={() =>
                            setBackupCodesDialogOpen(true)
                        }
                    >
                        {m["security.backupCodes"]()}
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
                    heading={m["security.passkeysHeading"]()}
                    action={
                        <Passkey.Add size="xs">
                            {m["security.passkeysAdd"]()}
                        </Passkey.Add>
                    }
                    p={m["security.passkeysDescription"]()}
                    pClassName="text-sm text-muted-foreground"
                />
                <Passkey.List data={passkeys} />
            </ContentView.Section>

            <ContentView.Section className="md:max-w-md">
                <ContentView.Header
                    as="h2"
                    heading={m["security.sessionsHeading"]()}
                    p={m["security.sessionsDescription"]()}
                    pClassName="text-sm text-muted-foreground"
                />
                {sessions === null ? (
                    <p className="text-sm text-muted-foreground">
                        {m[
                            "security.sessionsRequireRecentSignIn"
                        ]()}
                    </p>
                ) : (
                    <SessionList
                        data={sessions}
                        currentSessionToken={
                            data?.session.token
                        }
                    />
                )}
            </ContentView.Section>

            <ContentView.Section className="md:max-w-md">
                <ContentView.Header
                    as="h2"
                    heading={m[
                        "security.dangerZoneHeading"
                    ]()}
                    p={m["security.dangerZoneDescription"]()}
                    pClassName="text-sm text-muted-foreground"
                />
                <Button
                    type="button"
                    variant="destructive"
                    className="w-fit"
                    onClick={() =>
                        setDeleteAccountDialogOpen(true)
                    }
                >
                    {m["security.terminateAccount"]()}
                </Button>
            </ContentView.Section>

            <DeleteAccountDialog
                open={deleteAccountDialogOpen}
                onOpenChange={setDeleteAccountDialogOpen}
            />
        </ViewController>
    )
}
