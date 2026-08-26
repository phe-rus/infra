import { Toaster, toast } from "sonner"
import type { ToasterProps } from "sonner"

export function ToasterProvider(props: ToasterProps) {
    return (
        <Toaster
            position="bottom-right"
            gap={10}
            closeButton
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: [
                        "group relative flex w-full items-start gap-2.5 overflow-hidden border border-border",
                        "bg-popover text-popover-foreground",
                        "shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]",
                        "rounded-full px-3 py-2.5",
                        "has-[[data-description]]:rounded-2xl has-[[data-description]]:px-4 has-[[data-description]]:py-3",
                        "transition-[border-radius,padding] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    ].join(" "),
                    icon: "mt-0.5 shrink-0 animate-in zoom-in-50 fade-in duration-300 [&_svg]:size-4.5",
                    content: "flex flex-col",
                    title: "text-xs font-bold leading-tight",
                    description: "mt-2 text-xs leading-relaxed text-muted-foreground",
                    actionButton:
                        "mt-3 w-full rounded-full bg-muted px-4 py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-muted/70",
                    cancelButton:
                        "mt-3 w-full rounded-full bg-muted px-4 py-2.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted/70",
                    closeButton:
                        "absolute -top-1.5 -left-1.5 flex size-5 items-center justify-center rounded-full border border-border bg-popover text-muted-foreground opacity-0 shadow-sm transition-all duration-150 group-hover:opacity-100 hover:scale-110",
                    success: [
                        "[&_[data-icon]]:text-green-600 [&_[data-title]]:text-green-700",
                        "dark:[&_[data-icon]]:text-green-400 dark:[&_[data-title]]:text-green-400",
                        "[&_[data-button]]:bg-green-100 [&_[data-button]]:text-green-700",
                        "dark:[&_[data-button]]:bg-green-950 dark:[&_[data-button]]:text-green-400",
                        "[&_[data-button]]:hover:bg-green-200 dark:[&_[data-button]]:hover:bg-green-900",
                    ].join(" "),
                    error: [
                        "[&_[data-icon]]:text-destructive [&_[data-title]]:text-destructive",
                        "[&_[data-button]]:bg-destructive/10 [&_[data-button]]:text-destructive",
                        "[&_[data-button]]:hover:bg-destructive/20",
                    ].join(" "),
                    info: [
                        "[&_[data-icon]]:text-blue-600 [&_[data-title]]:text-blue-700",
                        "dark:[&_[data-icon]]:text-blue-400 dark:[&_[data-title]]:text-blue-400",
                        "[&_[data-button]]:bg-blue-100 [&_[data-button]]:text-blue-700",
                        "dark:[&_[data-button]]:bg-blue-950 dark:[&_[data-button]]:text-blue-400",
                        "[&_[data-button]]:hover:bg-blue-200 dark:[&_[data-button]]:hover:bg-blue-900",
                    ].join(" "),
                    warning: [
                        "[&_[data-icon]]:text-amber-600 [&_[data-title]]:text-amber-700",
                        "dark:[&_[data-icon]]:text-amber-400 dark:[&_[data-title]]:text-amber-400",
                        "[&_[data-button]]:bg-amber-100 [&_[data-button]]:text-amber-700",
                        "dark:[&_[data-button]]:bg-amber-950 dark:[&_[data-button]]:text-amber-400",
                        "[&_[data-button]]:hover:bg-amber-200 dark:[&_[data-button]]:hover:bg-amber-900",
                    ].join(" "),
                },
            }}
            {...props}
        />
    )
}
export const t = toast
