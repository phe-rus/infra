import { useRevokeUserSession, useRevokeUserSessions, type UserDetail } from "@/kit/users"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@infra/ui/components/button"
import { UAParser } from "ua-parser-js"
import type { FC } from "react"
import { cn } from "@infra/ui/lib/utils"

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
            {[...viewUser.sessions]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((session) => {
                    const parser = new UAParser(session.userAgent ?? '');

                    return (
                        <div
                            key={session.id}
                            className={cn("flex flex-col border", 'p-5')}
                        >
                            <div className={cn("flex w-full items-center")}>
                                <div className="flex flex-col">
                                    <h4>{parser.getOS().name} • <span className="text-muted-foreground">{session.ipAddress ?? "Unknown IP"}</span></h4>
                                    <p className="text-xs text-muted-foreground">
                                        <span className='text-primary mr-1'>Browser:</span>
                                        {parser.getBrowser().name} v{parser.getBrowser().version}
                                        <span className='text-primary mx-1'>•</span>
                                        <span className='text-primary mr-1'>Engine:</span>
                                        {parser.getEngine().name} v{parser.getEngine().version}
                                    </p>
                                </div>
                                {isOwner && (
                                    <Button
                                        type="button"
                                        variant='destructive'
                                        size="xs"
                                        className='ml-auto'
                                        onClick={() => void revokeSession({ data: { sessionToken: session.token } })}
                                    >
                                        Revoke
                                    </Button>
                                )}
                            </div>
                            <span className='bg-destructive h-px my-2' />
                            <div className="flex items-center gap-3 mt-1 truncate">
                                <span className="text-xs! text-muted-foreground">
                                    {formatDistanceToNow(session.createdAt, {
                                        addSuffix: true,
                                    })}
                                </span>
                                <span className="text-xs! text-muted-foreground">
                                    Expires {formatDistanceToNow(session.expiresAt, {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                        </div>
                    )
                })}
        </section>
    )
}
