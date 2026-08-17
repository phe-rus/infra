import { FieldInput } from "./input"
import { FieldCheckbox } from "./checkbox"
import { FieldTextarea } from "./textarea"
import { FieldSwitch } from "./switch"
import { FieldRadioCard } from "./radio-card"
import { FieldMultiselect } from "./multiselect"

export const fields = {
    input: FieldInput,
    checkbox: FieldCheckbox,
    textarea: FieldTextarea,
    switch: FieldSwitch,
    radioCard: FieldRadioCard,
    multiselect: FieldMultiselect
}

export * from "./input"
export * from "./checkbox"
export * from "./textarea"
export * from "./switch"
export * from "./radio-card"
export * from "./multiselect"
