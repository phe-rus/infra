import { type FC, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@infra/ui/components/select"
import { useWalletBalances } from "@/kit/payments"
import { cn } from "@infra/ui/lib/utils"

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
            className={cn("flex flex-col rounded-2xl p-10", "bg-card shadow hover:shadow-2xl")}
        >
            <div className="flex justify-between gap-3">
                <h1 className="text-5xl font-bold tracking-tight">Wallet balance</h1>
                <Select
                    aria-label="Preferred currency"
                    value={currency}
                    onChange={(key) => setCurrency(String(key))}
                >
                    <SelectTrigger className={cn("w-38 rounded-full! bg-input!", "border-0")}>
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
            </div>
            {data.total && (
                <p className="text-2xl leading-tight font-medium">
                    {data.total.amount.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                    })}{" "}
                    <sub className="text-xs text-primary">{data.total.currency}</sub>
                </p>
            )}
        </section>
    )
}
