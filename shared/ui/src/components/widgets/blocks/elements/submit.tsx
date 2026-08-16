import { IconLoader2 } from "@tabler/icons-react"
import { Button } from "../../../ui/button"
import { useFormContext } from "../contexts"

export function Submit({ label }: { label: string }) {
    const form = useFormContext()

    return (
        <form.Subscribe
            selector={(state) => [
                state.isSubmitting,
                state.canSubmit,
                state.isDirty,
                state.isTouched
            ]}
        >
            {([isSubmitting, canSubmit, isDirty, isTouched]) => {
                const isDisabled = isSubmitting || !canSubmit || !isDirty || !isTouched
                return (
                    <Button type="submit" isDisabled={isDisabled}>
                        {isSubmitting && <IconLoader2 className="animate-spin" />}
                        {label}
                    </Button>
                )
            }}
        </form.Subscribe>
    )
}
