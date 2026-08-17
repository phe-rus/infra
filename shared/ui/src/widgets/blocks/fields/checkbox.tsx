import { Field, FieldLabel } from "../../../components/field"
import { Checkbox } from "../../../components/checkbox"
import { useFieldContext } from "../contexts"

export function FieldCheckbox({ label }: { label: string }) {
    const field = useFieldContext<boolean>()

    return (
        <Field orientation="horizontal">
            <Checkbox
                id={field.name}
                name={field.name}
                aria-label={label}
                isSelected={field.state.value}
                onChange={field.handleChange}
            />
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        </Field>
    )
}
