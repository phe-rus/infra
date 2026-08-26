import { Toaster, toast } from "sonner"
import type { ToasterProps } from "sonner"

export function ToasterProvider(props: ToasterProps) {
    return (
        <Toaster
            position="bottom-right"
            gap={10}
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: "group flex w-full items-start gap-3 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-lg",
                    icon: "mt-0.5 shrink-0",
                    content: "flex flex-col gap-0.5",
                    title: "text-sm font-semibold leading-tight",
                    description: "text-xs text-muted-foreground",
                    actionButton:
                        "rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground",
                    cancelButton:
                        "rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground",
                    closeButton:
                        "border-border bg-popover text-muted-foreground",
                    success: "[&_[data-icon]]:text-primary",
                    error: "[&_[data-icon]]:text-destructive",
                    info: "[&_[data-icon]]:text-muted-foreground",
                },
            }}
            {...props}
        />
    )
}
export const t = toast
