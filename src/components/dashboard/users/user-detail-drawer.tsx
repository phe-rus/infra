import {
    useBanUser,
    useImpersonateUser,
    useRevokeUserSession,
    useRevokeUserSessions,
    useSetUserPassword,
    useUnbanUser,
    useUserDetail,
} from "@/hooks/usersHooks"
import { DrawerClose } from "@/components/ui/drawer"
import { DialogWidget } from "@/components/widgets/dialog-widget"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns/format"
import { useState } from "react"

const BAN_DURATIONS = [
    { id: "permanent", label: "Permanent", seconds: undefined },
    { id: "86400", label: "1 day", seconds: 60 * 60 * 24 },
    { id: "604800", label: "7 days", seconds: 60 * 60 * 24 * 7 },
    { id: "2592000", label: "30 days", seconds: 60 * 60 * 24 * 30 },
] as const

type UserDetailDrawerProps = {
    userId: string | null
    onClose: () => void
    isOwner: boolean
    currentUserId: string
}

export function UserDetailDrawer({ userId, onClose, isOwner, currentUserId }: UserDetailDrawerProps) {
    const { data, isLoading } = useUserDetail(userId)
    const { mutateAsync: banUser } = useBanUser()
    const { mutateAsync: unbanUser } = useUnbanUser()
    const { mutateAsync: revokeSession } = useRevokeUserSession()
    const { mutateAsync: revokeSessions } = useRevokeUserSessions()
    const { mutateAsync: setPassword } = useSetUserPassword()
    const { mutateAsync: impersonateUser } = useImpersonateUser()

    const [banReason, setBanReason] = useState("")
    const [banDuration, setBanDuration] = useState<string>("permanent")
    const [newPassword, setNewPassword] = useState("")

    const isSelf = userId === currentUserId

    async function handleBan() {
        if (!userId) return
        const duration = BAN_DURATIONS.find((d) => d.id === banDuration)
        await banUser({
            data: { userId, banReason: banReason.trim() || undefined, banExpiresIn: duration?.seconds },
        })
        setBanReason("")
        setBanDuration("permanent")
    }

    async function handleSetPassword() {
        if (!userId) return
        await setPassword({ data: { userId, newPassword } })
        setNewPassword("")
    }

    return (
        <DialogWidget
            open={Boolean(userId)}
            onOpenChange={(open) => !open && onClose()}
            title={data?.user.name ?? "User"}
            description={data?.user.email}
            footer={<DrawerClose render={<Button type="button" variant="outline" />}>Close</DrawerClose>}
        >
            {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}

            {data && (
                <>
                    <section className="flex flex-wrap gap-2">
                        <Badge variant={data.user.role === "user" ? "outline" : "secondary"}>
                            {data.user.role ?? "user"}
                        </Badge>
                        <Badge variant={data.user.emailVerified ? "outline" : "secondary"}>
                            {data.user.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant={data.user.banned ? "destructive" : "outline"}>
                            {data.user.banned ? "Banned" : "Active"}
                        </Badge>
                    </section>

                    <section className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div>
                            ID: <code className="text-foreground">{data.user.id}</code>
                        </div>
                        <div>Created {format(data.user.createdAt, "PPPp")}</div>
                        <div>Updated {format(data.user.updatedAt, "PPPp")}</div>
                    </section>

                    {isOwner && !isSelf && (
                        <>
                            <Separator />
                            <section className="flex flex-col gap-2">
                                <h3 className="text-sm font-medium">Ban</h3>
                                {data.user.banned ? (
                                    <>
                                        {data.user.banReason && (
                                            <p className="text-xs text-muted-foreground">
                                                Reason: {data.user.banReason}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {data.user.banExpires
                                                ? `Expires ${format(data.user.banExpires, "PPPp")}`
                                                : "Never expires"}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => void unbanUser({ data: { userId: data.user.id } })}
                                        >
                                            Unban
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Field>
                                            <FieldLabel htmlFor="ban-reason">Reason</FieldLabel>
                                            <Input
                                                id="ban-reason"
                                                value={banReason}
                                                onChange={(e) => setBanReason(e.target.value)}
                                                placeholder="Optional"
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="ban-duration">Duration</FieldLabel>
                                            <Select
                                                id="ban-duration"
                                                selectedKey={banDuration}
                                                onSelectionChange={(key) => setBanDuration(String(key))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {BAN_DURATIONS.map((d) => (
                                                        <SelectItem key={d.id} id={d.id}>
                                                            {d.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => void handleBan()}
                                        >
                                            Ban user
                                        </Button>
                                    </>
                                )}
                            </section>
                        </>
                    )}

                    <Separator />
                    <section className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Sessions</h3>
                            {isOwner && data.sessions.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => void revokeSessions({ data: { userId: data.user.id } })}
                                >
                                    Revoke all
                                </Button>
                            )}
                        </div>
                        {data.sessions.length === 0 && (
                            <p className="text-xs text-muted-foreground">No active sessions.</p>
                        )}
                        {data.sessions.map((session) => (
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
                                        onClick={() =>
                                            void revokeSession({ data: { sessionToken: session.token } })
                                        }
                                    >
                                        Revoke
                                    </Button>
                                )}
                            </div>
                        ))}
                    </section>

                    <Separator />
                    <section className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">Connected accounts</h3>
                        {data.accounts.length === 0 && (
                            <p className="text-xs text-muted-foreground">No connected accounts.</p>
                        )}
                        {data.accounts.map((account) => (
                            <div
                                key={account.id}
                                className="flex items-center justify-between border border-input px-2.5 py-1.5 text-xs"
                            >
                                <span className="capitalize">{account.providerId}</span>
                                <span className="text-muted-foreground">
                                    linked {format(account.createdAt, "PPP")}
                                </span>
                            </div>
                        ))}
                    </section>

                    {isOwner && (
                        <>
                            <Separator />
                            <section className="flex flex-col gap-2">
                                <h3 className="text-sm font-medium">Set new password</h3>
                                <Field>
                                    <FieldLabel htmlFor="new-password" className="sr-only">
                                        New password
                                    </FieldLabel>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="At least 8 characters"
                                    />
                                </Field>
                                <Button
                                    type="button"
                                    variant="outline"
                                    isDisabled={newPassword.length < 8}
                                    onClick={() => void handleSetPassword()}
                                >
                                    Set password
                                </Button>
                            </section>
                        </>
                    )}

                    {isOwner && !isSelf && (
                        <>
                            <Separator />
                            <section className="flex flex-col gap-2">
                                <h3 className="text-sm font-medium">Impersonate</h3>
                                <p className="text-xs text-muted-foreground">
                                    Sign in as this user. You can return to your own account from anywhere in
                                    the app.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => void impersonateUser({ data: { userId: data.user.id } })}
                                >
                                    Impersonate
                                </Button>
                            </section>
                        </>
                    )}
                </>
            )}
        </DialogWidget>
    )
}
