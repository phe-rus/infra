import { Input } from "@/components/ui/input"
import { useFieldContext } from "../contexts"
import { FieldWrapper } from "./wrapper"

type FieldInputProps = {
    label: string
} & Omit<React.ComponentProps<typeof Input>, "id" | "name" | "value" | "onChange" | "onBlur">

export function FieldInput({ label, ...inputProps }: FieldInputProps) {
    const field = useFieldContext<string>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <FieldWrapper name={field.name} label={label} isInvalid={isInvalid} errors={field.state.meta.errors}>
            <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                {...inputProps}
            />
        </FieldWrapper>
    )
}
