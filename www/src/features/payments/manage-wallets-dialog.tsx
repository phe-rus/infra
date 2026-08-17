import { useState, type ComponentProps, type PropsWithChildren } from "react"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { DrawerClose } from "@infra/ui/components/drawer"
import { Field, FieldLabel } from "@infra/ui/components/field"
import { Input } from "@infra/ui/components/input"
import { Button } from "@infra/ui/components/button"
import { Badge } from "@infra/ui/components/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@infra/ui/components/select"
import { cn } from "@infra/ui/lib/utils"
import { IconLoader2, IconStar, IconStarFilled, IconTrash } from "@tabler/icons-react"
import { useWallets, usePaymentConfig } from "@/functions/get-payments"
import { useAddWallet, useRemoveWallet, useSetPrimaryWallet } from "@/functions/use-payments"
import { useWalletFields } from "./use-wallet-fields"

type Wallet = ReturnType<typeof useWallets>["data"]["wallets"][number]

type TriggerProps = Omit<ComponentProps<"button">, "children" | "onClick" | "type">

function providerDisplayName(countries: ReturnType<typeof usePaymentConfig>["data"]["countries"], code: string) {
    for (const country of countries) {
        const match = country.providers.find((p) => p.provider === code)
        if (match) return match.displayName
    }
    return code
}

function WalletRow({ wallet }: { wallet: Wallet }) {
    const { data: config } = usePaymentConfig()
    const setPrimaryMutation = useSetPrimaryWallet()
    const removeMutation = useRemoveWallet()

    return (
        <div className={cn("flex items-center justify-between gap-3", "p-3 bg-accent rounded-md")}>
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{wallet.label || providerDisplayName(config.countries, wallet.provider)}</p>
                    {wallet.isPrimary && <Badge variant="secondary" className="rounded-full">Primary</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{wallet.phoneNumber}</p>
            </div>
            <div className="flex items-center gap-2">
                {!wallet.isPrimary && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon-xs"
                        className="rounded-full"
                        aria-label="Make primary"
                        isDisabled={setPrimaryMutation.isPending}
                        onClick={() => setPrimaryMutation.mutate(wallet.id)}
                    >
                        {setPrimaryMutation.isPending && setPrimaryMutation.variables === wallet.id
                            ? <IconLoader2 className="animate-spin" />
                            : <IconStar />}
                    </Button>
                )}
                {wallet.isPrimary && (
                    <Button type="button" variant="secondary" size="icon-xs" className="rounded-full" isDisabled aria-label="Primary">
                        <IconStarFilled />
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
                    {removeMutation.isPending && removeMutation.variables === wallet.id
                        ? <IconLoader2 className="animate-spin" />
                        : <IconTrash />}
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
                                    <img src={c.flag} alt="" className="h-3.5 w-5 object-cover rounded-none!" />
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

            <Button type="submit" isDisabled={!fields.phoneNumber.trim() || !fields.provider || addMutation.isPending}>
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
            <button type="button" onClick={() => setOpen(true)} {...props} className={cn("contents text-left", props.className)}>
                {children}
            </button>

            <DialogWidget
                open={open}
                onOpenChange={setOpen}
                title="Saved numbers"
                description="Manage the mobile money numbers linked to your account"
                footer={<DrawerClose render={<Button type="button" variant="outline" />}>Close</DrawerClose>}
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
