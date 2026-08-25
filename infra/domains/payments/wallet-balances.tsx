import { useState } from "react"
import type { FC } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@infra/ui/components/select"
import { useWalletBalances } from "@/domains/payments"
import { cn } from "@infra/ui/lib/utils"
import { IconCardsFilled } from "@tabler/icons-react"

const PREFERRED_CURRENCIES = [
    "UGX",
    "USD",
    "KES",
    "ZMW",
    "NGN",
    "GHS",
    "XAF",
    "XOF",
    "RWF",
    "TZS",
    "MWK",
    "MZN",
    "CDF",
    "SLE",
]

export const WalletBalances: FC = () => {
    const [currency, setCurrency] = useState("UGX")
    const { data } = useWalletBalances({ currency })

    return (
        <section
            className={cn(
                "relative flex flex-col rounded-2xl px-10",
                "bg-card shadow hover:shadow-md group",
                "py-5 border border-border/35"
            )}
        >
            <IconCardsFilled className="size-18" />
            <div className="flex justify-between gap-3">
                <h1 className="tracking-tight">Wallet balance</h1>
            </div>
            {data.total && (
                <p className="leading-tight font-medium">
                    <span className="text-base tracking-tighter font-light">
                        {data.total.amount.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                        })}{" "}
                    </span>
                    <sub className="text-sm text-primary">{data.total.currency}</sub>
                </p>
            )}
            <Select
                aria-label="Preferred currency"
                value={currency}
                onChange={(key) => setCurrency(String(key))}
            >
                <SelectTrigger
                    size="sm"
                    className={cn(
                        "w-38 rounded-full! bg-input!",
                        "border-0 absolute top-5 right-5"
                    )}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className={cn("max-h-40! rounded-md! px-1! *:no-scrollbar!", "pt-1 pb-20!")}
                >
                    {PREFERRED_CURRENCIES.map((code) => (
                        <SelectItem key={code} id={code} className="rounded-full!">
                            {code}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </section>
    )
}
