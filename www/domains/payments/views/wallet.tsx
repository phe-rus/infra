import { useState } from "react"
import type { ComponentProps, FC, PropsWithChildren } from "react"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { DrawerClose } from "@infra/ui/components/drawer"
import { Field, FieldLabel } from "@infra/ui/components/field"
import { Input } from "@infra/ui/components/input"
import { Button } from "@infra/ui/components/button"
import { Badge } from "@infra/ui/components/badge"
import { CountryProviderFields } from "@infra/ui/widgets/country-provider-fields"
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
import type { WalletsData, PaymentConfigData } from "../func"
import { useAddWallet, useRemoveWallet, useSetPrimaryWallet } from "../use-payments"
import { usePaymentFields } from "../use-payment-fields"
import { providerLabel } from "../provider-label"

type WalletEntry = WalletsData["wallets"][number]

type TriggerProps = Omit<ComponentProps<"button">, "children" | "onClick" | "type">

type ManageWalletsDialogProps = PropsWithChildren<TriggerProps> & {
    wallets: WalletEntry[]
    config: PaymentConfigData
}

type WalletRowProps = {
    wallet: WalletEntry
    config: PaymentConfigData
}

type CardsProps = PropsWithChildren

type ContentProps = {
    data: WalletEntry
    wallets: WalletEntry[]
    config: PaymentConfigData
}

type AddTileProps = {
    wallets: WalletEntry[]
    config: PaymentConfigData
}

const WALLET_PENDING_HOURS = 24

const formatPhoneNumber = (raw: string) =>
    raw
        .replace(/\D/g, "")
        .replace(/(\d{3})(?=\d)/g, "$1 ")
        .trim()

const hoursLeft = (createdAt: Date | string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime()
    const remaining = WALLET_PENDING_HOURS - elapsedMs / (60 * 60 * 1000)
    return Math.max(0, Math.ceil(remaining))
}

const WalletRow: FC<WalletRowProps> = ({ wallet, config }) => {
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

const AddWalletForm: FC = () => {
    const fields = usePaymentFields()
    const [label, setLabel] = useState("")
    const addMutation = useAddWallet()

    const handleAdd = async () => {
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
            <CountryProviderFields idPrefix="wallet" {...fields} />

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

const ManageWalletsDialog: FC<ManageWalletsDialogProps> = ({
    children,
    wallets,
    config,
    ...props
}) => {
    const [open, setOpen] = useState(false)

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
                    {wallets.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {wallets.map((wallet) => (
                                <WalletRow key={wallet.id} wallet={wallet} config={config} />
                            ))}
                        </div>
                    )}
                    <AddWalletForm />
                </div>
            </DialogWidget>
        </>
    )
}

const Cards: FC<CardsProps> = ({ children }) => (
    <div className={cn("grid grid-cols-2 gap-2")}>{children}</div>
)

const Content: FC<ContentProps> = ({ data, wallets, config }) => {
    const isVerified = data.status === "verified"

    return (
        <ManageWalletsDialog
            wallets={wallets}
            config={config}
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
                    "rounded-full bg-radial from-secondary",
                    "from-40% to-secondary blur-2xl",
                    "shadow-sm border border-primary"
                )}
            />
            <div className="flex items-start justify-between">
                <Button size="icon-xs" variant="secondary" className="rounded-full">
                    <IconCards />
                </Button>
                {data.isPrimary && <span className="text-xs font-light">Default</span>}
            </div>
            <div className="relative flex flex-col gap-1">
                <p className="font-mono text-base tracking-wider">
                    {formatPhoneNumber(data.phoneNumber)}
                </p>
                <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-primary-foreground/70">
                        {data.label || providerLabel(config.countries, data.provider)}
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
                        {isVerified ? "Verified" : `${hoursLeft(data.createdAt)}h`}
                    </span>
                </div>
            </div>
        </ManageWalletsDialog>
    )
}

const AddTile: FC<AddTileProps> = ({ wallets, config }) => {
    return (
        <ManageWalletsDialog
            wallets={wallets}
            config={config}
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

export const Wallet = { Cards, Content, AddTile }
