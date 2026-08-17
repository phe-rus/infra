import { REGEXP_ONLY_DIGITS } from "input-otp"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "../../../components/input-otp"
import { useFieldContext } from "../contexts"
import { FieldWrapper } from "./wrapper"

type FieldOtpProps = {
    label: string
    maxLength?: number
    onComplete?: (value: string) => void
}

export function FieldOtp({ label, maxLength = 6, onComplete }: FieldOtpProps) {
    const field = useFieldContext<string>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <FieldWrapper name={field.name} label={label} isInvalid={isInvalid} errors={field.state.meta.errors}>
            <InputOTP
                id={field.name}
                name={field.name}
                maxLength={maxLength}
                pattern={REGEXP_ONLY_DIGITS}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(value) => field.handleChange(value)}
                onComplete={onComplete}
                aria-invalid={isInvalid}
            >
                <InputOTPGroup>
                    {Array.from({ length: maxLength }, (_, index) => (
                        <InputOTPSlot key={index} index={index} />
                    ))}
                </InputOTPGroup>
            </InputOTP>
        </FieldWrapper>
    )
}
