import type { FC } from "react"
import { Button } from "@/components/ui/button"
import { useRevokeUserSession, useRevokeUserSessions } from "@/kit/hypermedia/users"
import type { UserDetail } from "@/kit/types"
import { format } from "date-fns/format"

export type RevokeUserSessionsProps = {
    viewUser: UserDetail
    isOwner: boolean
}

export const RevokeUserSessions: FC<RevokeUserSessionsProps> = ({ viewUser, isOwner }) => {
    const { mutateAsync: revokeSession } = useRevokeUserSession()
    const { mutateAsync: revokeSessions } = useRevokeUserSessions()

    return (
        <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Sessions</h3>
                {isOwner && viewUser.sessions.length > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => void revokeSessions({ data: { userId: viewUser.user.id } })}
                    >
                        Revoke all
                    </Button>
                )}
            </div>
            {viewUser.sessions.length === 0 && (
                <p className="text-xs text-muted-foreground">No active sessions.</p>
            )}
            {viewUser.sessions.map((session) => (
                <div
                    key={session.id}
                    className="flex items-center justify-between gap-2 border border-input px-2.5 py-1.5 text-xs"
                >
                    <div className="flex flex-col gap-0.5">
                        <span>{session.userAgent ?? "Unknown device"}</span>
                        <span className="text-muted-foreground">
                            {session.ipAddress ?? "Unknown IP"} · expires{" "}
                            {format(session.expiresAt, "PPP")}
                        </span>
                    </div>
                    {isOwner && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => void revokeSession({ data: { sessionToken: session.token } })}
                        >
                            Revoke
                        </Button>
                    )}
                </div>
            ))}
        </section>
    )
}
