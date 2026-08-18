import type { ReactNode } from "react"
import { Field, FieldLabel, FieldDescription } from "../../../components/field"
import { cn } from "../../../lib/utils"
import { useFieldContext } from "../contexts"

export type RadioCardOption = {
    label: string
    value: string
    description?: string
    icon?: ReactNode
    disabled?: boolean
}

export function FieldRadioCard({
    label,
    description,
    options,
    disabled,
    columns = 1,
}: {
    label: string
    description?: string
    options: RadioCardOption[]
    disabled?: boolean
    columns?: 1 | 2
}) {
    const field = useFieldContext<string>()

    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <div className={cn("grid grid-cols-1 gap-2", columns === 2 && "md:grid-cols-2")}>
                {options.map((option) => {
                    const selected = field.state.value === option.value
                    const optionDisabled = disabled || option.disabled
                    return (
                        <button
                            key={option.value}
                            type="button"
                            disabled={optionDisabled}
                            onClick={() => field.handleChange(option.value)}
                            aria-pressed={selected}
                            className={cn(
                                "flex flex-col items-start gap-0.5 rounded-none border p-3 text-left transition-colors",
                                selected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:bg-muted",
                                optionDisabled && "cursor-not-allowed opacity-50"
                            )}
                        >
                            <span className="flex items-center gap-1.5 text-sm font-medium">
                                {option.icon}
                                {option.label}
                            </span>
                            {option.description && (
                                <span className="text-xs text-muted-foreground">
                                    {option.description}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
            {description && <FieldDescription>{description}</FieldDescription>}
        </Field>
    )
}
