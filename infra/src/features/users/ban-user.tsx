import { type FC, useState } from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useBanUser, useUnbanUser, type UserDetail } from "@/kit/users"
import { format } from "date-fns/format"

const BAN_DURATIONS = [
    { id: "permanent", label: "Permanent", seconds: undefined },
    { id: "86400", label: "1 day", seconds: 60 * 60 * 24 },
    { id: "604800", label: "7 days", seconds: 60 * 60 * 24 * 7 },
    { id: "2592000", label: "30 days", seconds: 60 * 60 * 24 * 30 },
] as const

export type BanUserProps = {
    viewUser: UserDetail
}

export const BanUser: FC<BanUserProps> = ({ viewUser }) => {
    const { mutateAsync: banUser } = useBanUser()
    const { mutateAsync: unbanUser } = useUnbanUser()
    const [banReason, setBanReason] = useState("")
    const [banDuration, setBanDuration] = useState<string>("permanent")

    async function handleBan() {
        const duration = BAN_DURATIONS.find((d) => d.id === banDuration)
        await banUser({
            data: {
                userId: viewUser.user.id,
                banReason: banReason.trim() || undefined,
                banExpiresIn: duration?.seconds,
            },
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
                        <p className="text-xs text-muted-foreground">Reason: {viewUser.user.banReason}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {viewUser.user.banExpires
                            ? `Expires ${format(viewUser.user.banExpires, "PPPp")}`
                            : "Never expires"}
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void unbanUser({ data: { userId: viewUser.user.id } })}
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
                    <Button type="button" variant="destructive" onClick={() => void handleBan()}>
                        Ban user
                    </Button>
                </>
            )}
        </section>
    )
}
