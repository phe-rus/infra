import { Field, FieldLabel, FieldDescription } from "../../../ui/field"
import { Switch } from "../../../ui/switch"
import { useFieldContext } from "../contexts"

export function FieldSwitch({
    label,
    description,
    disabled,
}: {
    label: string
    description?: string
    disabled?: boolean
}) {
    const field = useFieldContext<boolean>()

    return (
        <Field orientation="horizontal">
            <Switch
                id={field.name}
                name={field.name}
                isSelected={field.state.value}
                onChange={field.handleChange}
                isDisabled={disabled}
            />
            <div className="flex flex-col gap-0.5">
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                {description && <FieldDescription>{description}</FieldDescription>}
            </div>
        </Field>
    )
}
