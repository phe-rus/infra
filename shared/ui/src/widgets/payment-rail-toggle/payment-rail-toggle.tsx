import { Button } from "../../components/button"

export type PaymentRail = "mobile-money" | "card"

export type PaymentRailToggleProps = {
    value: PaymentRail
    onChange: (rail: PaymentRail) => void
}

export function PaymentRailToggle({ value, onChange }: PaymentRailToggleProps) {
    return (
        <div className="flex gap-2">
            <Button
                type="button"
                size="sm"
                variant={value === "mobile-money" ? "default" : "outline"}
                onClick={() => onChange("mobile-money")}
            >
                Mobile Money
            </Button>
            <Button
                type="button"
                size="sm"
                variant={value === "card" ? "default" : "outline"}
                onClick={() => onChange("card")}
            >
                Card
            </Button>
        </div>
    )
}
