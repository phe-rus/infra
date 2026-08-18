import { useState } from "react"
import type { ComponentProps, PropsWithChildren } from "react"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { DrawerClose } from "@infra/ui/components/drawer"
import { Field, FieldLabel } from "@infra/ui/components/field"
import { Input } from "@infra/ui/components/input"
import { Button } from "@infra/ui/components/button"
import { Badge } from "@infra/ui/components/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@infra/ui/components/select"
import { cn } from "@infra/ui/lib/utils"
import {
    IconCards,
    IconCircleCheckFilled,
    IconClock,
    IconLoader2,
    IconPlus,
    IconStar,
    IconTrash,
} from "@tabler/icons-react"
import { useWallets, usePaymentConfig } from "@/functions/get-payments"
import { useAddWallet, useRemoveWallet, useSetPrimaryWallet } from "@/functions/use-payments"
import { useWalletFields } from "./use-wallet-fields"
import { providerLabel } from "./provider-label"

type Wallet = ReturnType<typeof useWallets>["data"]["wallets"][number]

type TriggerProps = Omit<ComponentProps<"button">, "children" | "onClick" | "type">

const WALLET_PENDING_HOURS = 24

function formatPhoneNumber(raw: string) {
    return raw
        .replace(/\D/g, "")
        .replace(/(\d{3})(?=\d)/g, "$1 ")
        .trim()
}

function hoursLeft(createdAt: Date | string) {
    const elapsedMs = Date.now() - new Date(createdAt).getTime()
    const remaining = WALLET_PENDING_HOURS - elapsedMs / (60 * 60 * 1000)
    return Math.max(0, Math.ceil(remaining))
}

function WalletRow({ wallet }: { wallet: Wallet }) {
    const { data: config } = usePaymentConfig()
    const setPrimaryMutation = useSetPrimaryWallet()
    const removeMutation = useRemoveWallet()
    const isVerified = wallet.status === "verified"

    return (
        <div className={cn("flex items-center justify-between gap-3", "rounded-md bg-accent p-3")}>
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">
                        {wallet.label || providerLabel(config.countries, wallet.provider)}
                    </p>
                    {wallet.isPrimary && (
                        <Badge variant="secondary" className="rounded-full">
                            Primary
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">{wallet.phoneNumber}</p>
                <p
                    className={cn(
                        "flex items-center gap-1 text-xs",
                        isVerified
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                    )}
                >
                    {isVerified ? (
                        <IconCircleCheckFilled className="size-3" />
                    ) : (
                        <IconClock className="size-3" />
                    )}
                    {isVerified
                        ? "Verified"
                        : `Pending · a real payment confirms it, or it's removed in ${hoursLeft(wallet.createdAt)}h`}
                </p>
            </div>
            <div className="flex items-center gap-2">
                {isVerified && !wallet.isPrimary && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon-xs"
                        className="rounded-full"
                        aria-label="Make primary"
                        isDisabled={setPrimaryMutation.isPending}
                        onClick={() => setPrimaryMutation.mutate(wallet.id)}
                    >
                        {setPrimaryMutation.isPending &&
                        setPrimaryMutation.variables === wallet.id ? (
                            <IconLoader2 className="animate-spin" />
                        ) : (
                            <IconStar />
                        )}
                    </Button>
                )}
                <Button
                    type="button"
                    variant="destructive"
                    size="icon-xs"
                    className="rounded-full"
                    aria-label="Remove"
                    isDisabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(wallet.id)}
                >
                    {removeMutation.isPending && removeMutation.variables === wallet.id ? (
                        <IconLoader2 className="animate-spin" />
                    ) : (
                        <IconTrash />
                    )}
                </Button>
            </div>
        </div>
    )
}

function AddWalletForm() {
    const fields = useWalletFields()
    const [label, setLabel] = useState("")
    const addMutation = useAddWallet()

    async function handleAdd() {
        if (!fields.provider || !fields.phoneNumber.trim()) return
        await addMutation.mutateAsync({
            phoneNumber: fields.phoneNumber,
            provider: fields.provider.provider,
            label: label.trim() || undefined,
        })
        setLabel("")
        fields.reset()
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void handleAdd()
            }}
            className="flex flex-col gap-3"
        >
            <Field>
                <FieldLabel htmlFor="wallet-country">Country</FieldLabel>
                <Select
                    id="wallet-country"
                    aria-label="Country"
                    selectedKey={fields.countryCode}
                    onSelectionChange={(key) => fields.selectCountry(String(key))}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {fields.countries.map((c) => (
                            <SelectItem key={c.country} id={c.country} textValue={c.name}>
                                <span className="flex items-center gap-2">
                                    <img
                                        src={c.flag}
                                        alt=""
                                        className="h-3.5 w-5 rounded-none! object-cover"
                                    />
                                    {c.name}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            <Field>
                <FieldLabel htmlFor="wallet-provider">Provider</FieldLabel>
                <Select
                    id="wallet-provider"
                    aria-label="Provider"
                    selectedKey={fields.providerCode}
                    onSelectionChange={(key) => fields.setProviderCode(String(key))}
                    isDisabled={!fields.country?.providers.length}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {fields.country?.providers.map((p) => (
                            <SelectItem key={p.provider} id={p.provider} textValue={p.displayName}>
                                <span className="flex items-center gap-2">
                                    <img src={p.logo} alt="" className="size-4 object-contain" />
                                    {p.displayName}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            <Field>
                <FieldLabel htmlFor="wallet-phone">Phone number</FieldLabel>
                <Input
                    id="wallet-phone"
                    value={fields.phoneNumber}
                    onChange={(e) => fields.setPhoneNumber(e.target.value)}
                    placeholder={fields.country ? `${fields.country.prefix}…` : undefined}
                />
            </Field>

            <Field>
                <FieldLabel htmlFor="wallet-label">Label (optional)</FieldLabel>
                <Input
                    id="wallet-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Personal"
                />
            </Field>

            <p className="text-xs text-muted-foreground">
                A saved number stays pending until you actually pay with it. Unused pending numbers
                are removed after {WALLET_PENDING_HOURS}h.
            </p>

            <Button
                type="submit"
                isDisabled={!fields.phoneNumber.trim() || !fields.provider || addMutation.isPending}
            >
                {addMutation.isPending ? "Saving…" : "Save number"}
            </Button>
        </form>
    )
}

export function ManageWalletsDialog({ children, ...props }: PropsWithChildren<TriggerProps>) {
    const [open, setOpen] = useState(false)
    const { data } = useWallets()

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                {...props}
                className={cn("contents text-left", props.className)}
            >
                {children}
            </button>

            <DialogWidget
                open={open}
                onOpenChange={setOpen}
                title="Saved numbers"
                description="Manage the mobile money numbers linked to your account"
                footer={
                    <DrawerClose render={<Button type="button" variant="outline" />}>
                        Close
                    </DrawerClose>
                }
            >
                <div className="flex flex-col gap-3">
                    {data.wallets.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {data.wallets.map((wallet) => (
                                <WalletRow key={wallet.id} wallet={wallet} />
                            ))}
                        </div>
                    )}
                    <AddWalletForm />
                </div>
            </DialogWidget>
        </>
    )
}

function WalletCard({ wallet }: { wallet: Wallet }) {
    const { data: config } = usePaymentConfig()
    const isVerified = wallet.status === "verified"

    return (
        <ManageWalletsDialog
            className={cn(
                "flex-col justify-between overflow-hidden rounded-md p-4",
                "relative col-span-1 flex h-28 shrink-0 snap-start",
                "bg-input/35"
            )}
        >
            <div
                aria-hidden
                className={cn(
                    "absolute -top-10 -right-10 size-32",
                    "rounded-full bg-radial from-pink-400",
                    "from-40% to-fuchsia-700 blur-2xl"
                )}
            />
            <div className="flex items-start justify-between">
                <Button size="icon-xs" variant="secondary" className="rounded-full">
                    <IconCards />
                </Button>
                {wallet.isPrimary && <span className="text-xs font-light">Default</span>}
            </div>
            <div className="relative flex flex-col gap-1">
                <p className="font-mono text-base tracking-wider">
                    {formatPhoneNumber(wallet.phoneNumber)}
                </p>
                <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-primary-foreground/70">
                        {wallet.label || providerLabel(config.countries, wallet.provider)}
                    </span>
                    <span
                        className={cn(
                            "flex shrink-0 items-center gap-1 text-[10px] font-medium",
                            isVerified ? "text-emerald-400" : "text-amber-400"
                        )}
                    >
                        {isVerified ? (
                            <IconCircleCheckFilled className="size-3" />
                        ) : (
                            <IconClock className="size-3" />
                        )}
                        {isVerified ? "Verified" : `${hoursLeft(wallet.createdAt)}h`}
                    </span>
                </div>
            </div>
        </ManageWalletsDialog>
    )
}

function AddWalletCardTile() {
    return (
        <ManageWalletsDialog
            className={cn(
                "col-span-1 flex h-28 shrink-0 snap-start",
                "flex-col items-center justify-center gap-2",
                "rounded-md border border-dashed",
                "border-border text-muted-foreground"
            )}
        >
            <IconPlus />
            <span className="text-xs">Add a number</span>
        </ManageWalletsDialog>
    )
}

export function WalletCards() {
    const { data } = useWallets()

    return (
        <div className={cn("grid grid-cols-2 gap-2")}>
            {data.wallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
            ))}
            <AddWalletCardTile />
        </div>
    )
}
