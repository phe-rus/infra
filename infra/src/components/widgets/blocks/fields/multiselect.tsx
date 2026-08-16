import { Field, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { useFieldContext } from "../contexts"

export type MultiselectOption = { label: string; value: string }

export function FieldMultiselect({ label, options }: { label: string; options: MultiselectOption[] }) {
    const field = useFieldContext<string[]>()

    function toggle(value: string, checked: boolean) {
        const current = field.state.value
        field.handleChange(checked ? [...current, value] : current.filter((v) => v !== value))
    }

    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <div className="flex flex-col gap-2">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                            id={`${field.name}-${option.value}`}
                            aria-label={option.label}
                            isSelected={field.state.value.includes(option.value)}
                            onChange={(checked) => toggle(option.value, checked)}
                        />
                        <label htmlFor={`${field.name}-${option.value}`} className="text-sm">
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </Field>
    )
}
