import type { FC } from "react"
import { DrawerClose } from "@/components/ui/drawer"
import { DialogWidget } from "@/components/widgets/dialog-widget"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useUserDetail } from "@/kit/users"
import { format } from "date-fns/format"
import { UpdateUser } from "./update-user"
import { BanUser } from "./ban-user"
import { RevokeUserSessions } from "./revoke-user-sessions"
import { UserAccounts } from "./user-accounts"
import { SetUserPassword } from "./set-user-password"
import { ImpersonateUser } from "./impersonate-user"
import { DisableTwoFactor } from "./disable-two-factor"

export type GetUserDetailProps = {
    userId: string | null
    onClose: () => void
    currentUserId: string
    isOwner: boolean
}

export const GetUserDetail: FC<GetUserDetailProps> = ({
    userId,
    onClose,
    currentUserId,
    isOwner,
}) => {
    const { data: viewUser, isLoading } = useUserDetail(userId)
    const isViewingSelf = userId === currentUserId

    return (
        <DialogWidget
            open={Boolean(userId)}
            onOpenChange={(open) => !open && onClose()}
            title={viewUser?.user.name ?? "User"}
            description={viewUser?.user.email}
            footer={<DrawerClose render={<Button type="button" variant="outline" />}>Close</DrawerClose>}
        >
            {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}

            {viewUser && (
                <>
                    <section className="flex flex-wrap gap-2">
                        <Badge variant={viewUser.user.role === "user" ? "outline" : "secondary"}>
                            {viewUser.user.role ?? "user"}
                        </Badge>
                        <Badge variant={viewUser.user.emailVerified ? "outline" : "secondary"}>
                            {viewUser.user.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant={viewUser.user.banned ? "destructive" : "outline"}>
                            {viewUser.user.banned ? "Banned" : "Active"}
                        </Badge>
                        <Badge variant={viewUser.user.twoFactorEnabled ? "outline" : "secondary"}>
                            {viewUser.user.twoFactorEnabled ? "2FA on" : "2FA off"}
                        </Badge>
                    </section>

                    <section className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div>
                            ID: <code className="text-foreground">{viewUser.user.id}</code>
                        </div>
                        <div>Created {format(viewUser.user.createdAt, "PPPp")}</div>
                        <div>Updated {format(viewUser.user.updatedAt, "PPPp")}</div>
                    </section>

                    <Separator />
                    <UpdateUser viewUser={viewUser} />

                    {isOwner && !isViewingSelf && (
                        <>
                            <Separator />
                            <BanUser viewUser={viewUser} />
                        </>
                    )}

                    <Separator />
                    <RevokeUserSessions viewUser={viewUser} isOwner={isOwner} />

                    <Separator />
                    <UserAccounts viewUser={viewUser} />

                    {isOwner && (
                        <>
                            <Separator />
                            <SetUserPassword userId={viewUser.user.id} />
                        </>
                    )}

                    {isOwner && viewUser.user.twoFactorEnabled && (
                        <>
                            <Separator />
                            <DisableTwoFactor viewUser={viewUser} />
                        </>
                    )}

                    {isOwner && !isViewingSelf && (
                        <>
                            <Separator />
                            <ImpersonateUser userId={viewUser.user.id} />
                        </>
                    )}
                </>
            )}
        </DialogWidget>
    )
}
