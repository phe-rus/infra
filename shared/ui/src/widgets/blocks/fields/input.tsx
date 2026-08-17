import { IconEye, IconEyeOff } from "@tabler/icons-react"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
} from "../../../components/input-group"
import { useState, type ReactNode } from "react"
import { useFieldContext } from "../contexts"
import { FieldWrapper } from "./wrapper"

type FieldInputProps = {
    label: string
    icon?: ReactNode
} & Omit<
    React.ComponentProps<typeof InputGroupInput>,
    "id" | "name" | "value" | "onChange" | "onBlur"
>

export function FieldInput({ label, icon, type = "text", ...inputProps }: FieldInputProps) {
    const field = useFieldContext<string>()
    const [showPassword, setShowPassword] = useState(false)
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    const isPassword = type === "password"

    return (
        <FieldWrapper
            name={field.name}
            label={label}
            isInvalid={isInvalid}
            errors={field.state.meta.errors}
        >
            <InputGroup>
                {icon && (
                    <InputGroupAddon align="inline-start">
                        <InputGroupText>{icon}</InputGroupText>
                    </InputGroupAddon>
                )}
                <InputGroupInput
                    id={field.name}
                    name={field.name}
                    type={isPassword && showPassword ? "text" : type}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    {...inputProps}
                />
                {isPassword && (
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton
                            type="button"
                            size="icon-xs"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <IconEyeOff /> : <IconEye />}
                        </InputGroupButton>
                    </InputGroupAddon>
                )}
            </InputGroup>
        </FieldWrapper>
    )
}
