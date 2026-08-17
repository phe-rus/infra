import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Badge } from "@infra/ui/components/badge"
import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import type { Passkey } from "@better-auth/passkey/client"
import { format } from "date-fns"
import { currentOptions } from "@/functions/get-auth"
import { passkeysOptions, useDeletePasskey } from "@/functions/get-security"
import { EnableTwoFactorDialog, DisableTwoFactorDialog, AddPasskeyDialog } from "@/features/security"

export const Route = createFileRoute("/_workspace/security")({
    component: RouteComponent,
})

function PasskeyRow({ passkey }: { passkey: Passkey }) {
    const deleteMutation = useDeletePasskey()

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
                <p className="text-sm">{passkey.name || "Passkey"}</p>
                <p className="text-xs text-muted-foreground">Added {format(String(passkey.createdAt), "PPP")}</p>
            </div>
            <Button
                type="button"
                variant="outline"
                isDisabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(passkey.id)}
            >
                {deleteMutation.isPending ? "Removing…" : "Remove"}
            </Button>
        </div>
    )
}

function RouteComponent() {
    const { data } = useSuspenseQuery(currentOptions())
    const isTwoFactorEnabled = Boolean(data?.user?.twoFactorEnabled)

    const { data: passkeys } = useSuspenseQuery(passkeysOptions())

    return (
        <article className={cn(
            'container mx-auto flex w-full flex-col',
            'gap-5 py-20 md:max-w-3xl'
        )}>
            <section>
                <h1 className="text-3xl md:text-4xl">Security & sign-in</h1>
                <p className="text-muted-foreground">Manage how you sign in and keep your account secure</p>
            </section>

            <section className="flex flex-col gap-2">
                <div className='flex flex-col'>
                    <h2>Two-factor authentication</h2>
                    <p className='text-sm'>Require a code from an authenticator app when signing in</p>
                </div>

                <Badge variant={isTwoFactorEnabled ? "outline" : "secondary"} className="w-fit">
                    {isTwoFactorEnabled ? "2FA on" : "2FA off"}
                </Badge>

                {isTwoFactorEnabled ? (
                    <DisableTwoFactorDialog>Disable 2FA</DisableTwoFactorDialog>
                ) : (
                    <EnableTwoFactorDialog>Enable 2FA</EnableTwoFactorDialog>
                )}
            </section>

            <section className="flex flex-col gap-3">
                <div className='flex flex-col'>
                    <h2>Passkeys</h2>
                    <p className='text-sm'>Sign in without a password, using your device's biometrics or a security key</p>
                </div>

                {passkeys && passkeys.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {passkeys.map((passkey) => (
                            <PasskeyRow key={passkey.id} passkey={passkey} />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No passkeys yet</p>
                )}

                <AddPasskeyDialog>Add a passkey</AddPasskeyDialog>
            </section>
        </article>
    )
}
