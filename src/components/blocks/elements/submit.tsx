import { IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useFormContext } from "../contexts"

export function Submit({ label }: { label: string }) {
    const form = useFormContext()

    return (
        <form.Subscribe
            selector={(state) => [
                state.canSubmit,
                state.isSubmitting
            ]}
        >
            {([canSubmit, isSubmitting]) => (
                <Button type="submit" isDisabled={!canSubmit}>
                    {isSubmitting && <IconLoader2 className="animate-spin" />}
                    {label}
                </Button>
            )}
        </form.Subscribe>
    )
}
