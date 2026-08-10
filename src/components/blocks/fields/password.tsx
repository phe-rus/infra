import { IconEye, IconEyeOff } from "@tabler/icons-react"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { useState } from "react"
import { useFieldContext } from "../contexts"
import { FieldWrapper } from "./wrapper"

export function FieldPassword({ label, autoComplete }: { label: string; autoComplete?: string }) {
    const field = useFieldContext<string>()
    const [showPassword, setShowPassword] = useState(false)
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <FieldWrapper name={field.name} label={label} isInvalid={isInvalid} errors={field.state.meta.errors}>
            <InputGroup>
                <InputGroupInput
                    id={field.name}
                    name={field.name}
                    type={showPassword ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete={autoComplete}
                    placeholder="Enter your password"
                />
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
            </InputGroup>
        </FieldWrapper>
    )
}
