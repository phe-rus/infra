import { useState } from "react"
import type { FC } from "react"
import { formatUtc } from "@infra/ui/lib/date"
import { UAParser } from "ua-parser-js"
import { Button } from "@infra/ui/components/button"
import { Badge } from "@infra/ui/components/badge"
import { cn } from "@infra/ui/lib/utils"
import { IconLoader2, IconTrash } from "@tabler/icons-react"
import type { SessionsData } from "@/domains/security"
import { useRevokeSession } from "@/domains/security"

type SessionListProps = {
    data: SessionsData
    currentSessionToken: string | undefined
}

const describeDevice = (userAgent: string | null | undefined) => {
    const { browser, os } = new UAParser(userAgent ?? "").getResult()
    return `${browser.name ?? "A browser"} on ${os.name ?? "an unknown OS"}`
}

export const SessionList: FC<SessionListProps> = ({ data, currentSessionToken }) => {
    const revokeMutation = useRevokeSession()
    const [revokingToken, setRevokingToken] = useState<string | null>(null)

    return (
        <div className="flex flex-col gap-3">
            {[...data]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                )
                .map((session) => {
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
                                    {formatUtc(String(session.createdAt), "PPP")}
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
                                        revokeMutation.isPending && revokingToken === session.token
                                    }
                                    onClick={() => {
                                        setRevokingToken(session.token)
                                        revokeMutation.mutate(session.token)
                                    }}
                                >
                                    {revokeMutation.isPending && revokingToken === session.token ? (
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
    )
}
