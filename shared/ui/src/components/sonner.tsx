import { Toaster, toast } from "sonner"
import type { ToasterProps } from "sonner"

export function ToasterProvider(props: ToasterProps) {
    return <Toaster position="bottom-right" {...props} richColors />
}
export const t = toast
