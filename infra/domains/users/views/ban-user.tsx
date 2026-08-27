import { useState } from "react"
import type { FC } from "react"
import { Field, FieldLabel } from "@infra/ui/components/field"
import { Input } from "@infra/ui/components/input"
import { Button } from "@infra/ui/components/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@infra/ui/components/select"
import { useBanUser, useUnbanUser } from "@/domains/users"
import type { UserDetail } from "@/domains/users"
import { formatUtc } from "@infra/ui/lib/date"

const BAN_DURATIONS = [
    { id: "permanent", label: "Permanent", seconds: undefined },
    { id: "86400", label: "1 day", seconds: 60 * 60 * 24 },
    { id: "604800", label: "7 days", seconds: 60 * 60 * 24 * 7 },
    { id: "2592000", label: "30 days", seconds: 60 * 60 * 24 * 30 },
] as const

export type BanUserProps = {
    viewUser: UserDetail
    currentUserId: string
}

export const BanUser: FC<BanUserProps> = ({ viewUser, currentUserId }) => {
    const { mutateAsync: banUser } = useBanUser(currentUserId)
    const { mutateAsync: unbanUser } = useUnbanUser()
    const [banReason, setBanReason] = useState("")
    const [banDuration, setBanDuration] = useState<string>("permanent")

    async function handleBan() {
        const duration = BAN_DURATIONS.find((d) => d.id === banDuration)
        await banUser({
            userId: viewUser.user.id,
            banReason: banReason.trim() || undefined,
            banExpiresIn: duration?.seconds,
        })
        setBanReason("")
        setBanDuration("permanent")
    }

    return (
        <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Ban</h3>
            {viewUser.user.banned ? (
                <>
                    {viewUser.user.banReason && (
                        <p className="text-xs text-muted-foreground">
                            Reason: {viewUser.user.banReason}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {viewUser.user.banExpires
                            ? `Expires ${formatUtc(viewUser.user.banExpires, "PPPp")}`
                            : "Never expires"}
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            void unbanUser(viewUser.user.id)
                        }
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
                            aria-label="Duration"
                            selectedKey={banDuration}
                            onSelectionChange={(key) =>
                                setBanDuration(String(key))
                            }
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
    )
}
