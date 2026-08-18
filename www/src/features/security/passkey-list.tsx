import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { formatUtc } from "@infra/ui/lib/date"
import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { IconLoader2, IconPencil, IconTrash } from "@tabler/icons-react"
import { passkeysOptions, useDeletePasskey } from "@/functions/get-security"
import { RenamePasskeyDialog } from "./passkeys"

export function PasskeyList() {
    const { data: passkeys } = useSuspenseQuery(passkeysOptions())
    const deleteMutation = useDeletePasskey()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    if (passkeys.length === 0) {
        return <p className="text-sm text-muted-foreground">No passkeys yet</p>
    }

    return (
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
                            Added {formatUtc(String(passkey.createdAt), "PPP")}
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
                            isDisabled={deleteMutation.isPending && deletingId === passkey.id}
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
    )
}
