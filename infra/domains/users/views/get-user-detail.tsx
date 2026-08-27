import { useState } from "react"
import type { FC } from "react"
import { DrawerClose } from "@infra/ui/components/drawer"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { Badge } from "@infra/ui/components/badge"
import { Button } from "@infra/ui/components/button"
import { Separator } from "@infra/ui/components/separator"
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@infra/ui/components/tabs"
import { useUserDetail } from "@/domains/users"
import { formatUtc } from "@infra/ui/lib/date"
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
}

export const GetUserDetail: FC<GetUserDetailProps> = ({
    userId,
    onClose,
    currentUserId,
}) => {
    const { data: viewUser, isLoading } = useUserDetail(userId)
    const isViewingSelf = userId === currentUserId
    const [tab, setTab] = useState("overview")

    return (
        <DialogWidget
            open={Boolean(userId)}
            onOpenChange={(open) => !open && onClose()}
            title={viewUser?.user.name ?? "User"}
            description={viewUser?.user.email}
            footer={
                <DrawerClose
                    render={<Button type="button" variant="outline" />}
                >
                    Close
                </DrawerClose>
            }
        >
            {isLoading && (
                <p className="text-xs text-muted-foreground">
                    Loading…
                </p>
            )}

            {viewUser && (
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList variant="line" className="px-0! gap-1!">
                        <TabsTrigger
                            value="overview"
                            className="text-xs! px-0!"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="accounts"
                            className="text-xs! px-0!"
                        >
                            Accounts
                        </TabsTrigger>
                        <TabsTrigger
                            value="sessions"
                            className="text-xs! px-0!"
                        >
                            Sessions
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="overview"
                        className="flex flex-col gap-4"
                    >
                        <section className="flex flex-wrap gap-2">
                            <Badge
                                variant={
                                    viewUser.user.role === "user"
                                        ? "outline"
                                        : "secondary"
                                }
                            >
                                {viewUser.user.role ?? "user"}
                            </Badge>
                            <Badge
                                variant={
                                    viewUser.user.emailVerified
                                        ? "outline"
                                        : "secondary"
                                }
                            >
                                {viewUser.user.emailVerified
                                    ? "Verified"
                                    : "Unverified"}
                            </Badge>
                            <Badge
                                variant={
                                    viewUser.user.banned
                                        ? "destructive"
                                        : "outline"
                                }
                            >
                                {viewUser.user.banned
                                    ? "Banned"
                                    : "Active"}
                            </Badge>
                            <Badge
                                variant={
                                    viewUser.user.twoFactorEnabled
                                        ? "outline"
                                        : "secondary"
                                }
                            >
                                {viewUser.user.twoFactorEnabled
                                    ? "2FA on"
                                    : "2FA off"}
                            </Badge>
                        </section>

                        <section className="flex flex-col gap-1 text-xs text-muted-foreground">
                            <div>
                                ID:{" "}
                                <code className="text-foreground">
                                    {viewUser.user.id}
                                </code>
                            </div>
                            <div>
                                Created{" "}
                                {formatUtc(
                                    viewUser.user.createdAt,
                                    "PPPp"
                                )}
                            </div>
                            <div>
                                Updated{" "}
                                {formatUtc(
                                    viewUser.user.updatedAt,
                                    "PPPp"
                                )}
                            </div>
                        </section>

                        <Separator />
                        <UpdateUser
                            viewUser={viewUser}
                            currentUserId={currentUserId}
                        />

                        <Separator />
                        <SetUserPassword userId={viewUser.user.id} />

                        {viewUser.user.twoFactorEnabled && (
                            <>
                                <Separator />
                                <DisableTwoFactor viewUser={viewUser} />
                            </>
                        )}

                        {(!isViewingSelf || import.meta.env.DEV) && (
                            <>
                                <Separator />
                                <ImpersonateUser
                                    userId={viewUser.user.id}
                                />
                            </>
                        )}
                    </TabsContent>

                    <TabsContent
                        value="accounts"
                        className="flex flex-col gap-5!"
                    >
                        <UserAccounts viewUser={viewUser} />

                        {(!isViewingSelf || import.meta.env.DEV) && (
                            <>
                                <Separator />
                                <BanUser viewUser={viewUser} />
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="sessions">
                        <RevokeUserSessions viewUser={viewUser} />
                    </TabsContent>
                </Tabs>
            )}
        </DialogWidget>
    )
}
