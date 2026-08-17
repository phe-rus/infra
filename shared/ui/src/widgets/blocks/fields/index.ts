import { FieldInput } from "./input"
import { FieldCheckbox } from "./checkbox"
import { FieldTextarea } from "./textarea"
import { FieldSwitch } from "./switch"
import { FieldRadioCard } from "./radio-card"
import { FieldMultiselect } from "./multiselect"
import { FieldAvatar } from "./avatar"
import { FieldOtp } from "./otp"

export const fields = {
    input: FieldInput,
    checkbox: FieldCheckbox,
    textarea: FieldTextarea,
    switch: FieldSwitch,
    radioCard: FieldRadioCard,
    multiselect: FieldMultiselect,
    avatar: FieldAvatar,
    otp: FieldOtp
}

export * from "./input"
export * from "./checkbox"
export * from "./textarea"
export * from "./switch"
export * from "./radio-card"
export * from "./multiselect"
export * from "./avatar"
export * from "./otp"
