import { Textarea } from "@/components/ui/textarea"
import { useFieldContext } from "../contexts"
import { FieldWrapper } from "./wrapper"

type FieldTextareaProps = {
    label: string
} & Omit<React.ComponentProps<typeof Textarea>, "id" | "name" | "value" | "onChange" | "onBlur">

export function FieldTextarea({ label, ...props }: FieldTextareaProps) {
    const field = useFieldContext<string>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <FieldWrapper name={field.name} label={label} isInvalid={isInvalid} errors={field.state.meta.errors}>
            <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                {...props}
            />
        </FieldWrapper>
    )
}
