import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    CancelCircleIcon,
    Cancel01Icon,
    CheckmarkCircle02Icon,
    InformationCircleIcon,
    Loading03Icon,
    TriangleAlertIcon,
} from "@hugeicons/core-free-icons"
import { format } from "date-fns"
import type { ComponentPropsWithoutRef } from "react"

import { cn } from "../lib/utils"
import { Button } from "./button"

const manager = ToastPrimitive.createToastManager()

const TYPE_TEXT: Record<string, string> = {
    success: "text-green-600 dark:text-green-400",
    error: "text-destructive",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-blue-600 dark:text-blue-400",
}

const TYPE_ACTION: Record<string, string> = {
    success:
        "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900",
    error: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    warning:
        "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900",
    info: "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900",
}

function ToastPortal(props: ToastPrimitive.Portal.Props) {
    return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({
    className,
    ...props
}: ToastPrimitive.Viewport.Props) {
    return (
        <ToastPrimitive.Viewport
            data-slot="toast-viewport"
            className={cn(
                "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
                className
            )}
            {...props}
        />
    )
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
    return (
        <ToastPrimitive.Root
            data-slot="toast"
            className={cn(
                "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-full border border-border bg-popover text-popover-foreground shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] will-change-transform outline-none select-none has-data-[slot=toast-description]:rounded-2xl focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
                "h-(--height) transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.34,1.56,0.64,1),opacity_500ms,height_150ms]",
                "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
                "data-expanded:h-(--toast-height) data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
                "data-limited:opacity-0 data-starting-style:transform-[translateY(150%)]",
                "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:transform-[translateY(150%)]",
                "data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]",
                "data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
                "data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
                "data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]",
                "data-expanded:data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]",
                "data-expanded:data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
                "data-expanded:data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
                "data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]",
                className
            )}
            {...props}
        />
    )
}

function ToastContent({
    className,
    ...props
}: ToastPrimitive.Content.Props) {
    return (
        <ToastPrimitive.Content
            data-slot="toast-content"
            className={cn(
                "flex h-full items-center gap-2.5 overflow-hidden px-3 py-2.5 transition-[padding,opacity] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100 has-data-[slot=toast-description]:items-start has-data-[slot=toast-description]:px-4 has-data-[slot=toast-description]:py-3",
                className
            )}
            {...props}
        />
    )
}

function ToastTitle({
    className,
    ...props
}: ToastPrimitive.Title.Props) {
    return (
        <ToastPrimitive.Title
            data-slot="toast-title"
            className={cn("text-xs leading-tight font-bold", className)}
            {...props}
        />
    )
}

function ToastDescription({
    className,
    ...props
}: ToastPrimitive.Description.Props) {
    return (
        <ToastPrimitive.Description
            data-slot="toast-description"
            className={cn(
                "mt-2 text-xs leading-relaxed text-muted-foreground",
                className
            )}
            {...props}
        />
    )
}

function ToastAction({
    className,
    render = <Button variant="outline" size="sm" />,
    ...props
}: ToastPrimitive.Action.Props) {
    return (
        <ToastPrimitive.Action
            data-slot="toast-action"
            render={render}
            className={cn(
                "mt-3 w-full shrink-0 rounded-full",
                className
            )}
            {...props}
        />
    )
}

function ToastClose({
    className,
    children,
    render = <Button variant="ghost" size="icon-sm" />,
    ...props
}: ToastPrimitive.Close.Props) {
    return (
        <ToastPrimitive.Close
            data-slot="toast-close"
            aria-label="Close toast"
            render={render}
            className={cn(
                "shrink-0 rounded-full text-muted-foreground hover:text-foreground",
                className
            )}
            {...props}
        >
            {children ?? <HugeiconsIcon icon={Cancel01Icon} aria-hidden="true" />}
        </ToastPrimitive.Close>
    )
}

function ToastIcon({ type }: { type: string | undefined }) {
    const cls = cn("size-4.5", type ? TYPE_TEXT[type] : undefined)
    if (type === "success")
        return <HugeiconsIcon icon={CheckmarkCircle02Icon} className={cls} aria-hidden="true" />
    if (type === "error")
        return <HugeiconsIcon icon={CancelCircleIcon} className={cls} aria-hidden="true" />
    if (type === "warning")
        return <HugeiconsIcon icon={TriangleAlertIcon} className={cls} aria-hidden="true" />
    if (type === "info")
        return <HugeiconsIcon icon={InformationCircleIcon} className={cls} aria-hidden="true" />
    if (type === "loading")
        return (
            <HugeiconsIcon
                icon={Loading03Icon}
                className="size-4.5 animate-spin text-muted-foreground"
                aria-hidden="true"
            />
        )
    return null
}

function ToastList() {
    const { toasts } = ToastPrimitive.useToastManager()

    return toasts.map((toastItem) => {
        const createdAt = (
            toastItem.data as { createdAt?: number } | undefined
        )?.createdAt
        return (
            <Toast key={toastItem.id} toast={toastItem}>
                <ToastContent>
                    <ToastIcon type={toastItem.type} />
                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2">
                            <ToastTitle
                                className={
                                    toastItem.type
                                        ? TYPE_TEXT[toastItem.type]
                                        : undefined
                                }
                            />
                            {createdAt !== undefined && (
                                <span className="ml-auto shrink-0 text-[11px] font-normal text-muted-foreground">
                                    {format(createdAt, "h:mm a")}
                                </span>
                            )}
                        </div>
                        {toastItem.description && <ToastDescription />}
                        {toastItem.actionProps && (
                            <ToastAction
                                className={
                                    toastItem.type
                                        ? TYPE_ACTION[toastItem.type]
                                        : undefined
                                }
                            />
                        )}
                    </div>
                    <ToastClose />
                </ToastContent>
            </Toast>
        )
    })
}

export function ToasterProvider(props: ToastPrimitive.Provider.Props) {
    return (
        <ToastPrimitive.Provider toastManager={manager} {...props}>
            <ToastPortal>
                <ToastViewport>
                    <ToastList />
                </ToastViewport>
            </ToastPortal>
        </ToastPrimitive.Provider>
    )
}

type ToastOptions = {
    description?: string
    duration?: number
    actionProps?: ComponentPropsWithoutRef<"button">
}
type ToastArgs = [title: string, options?: ToastOptions]
function add(
    type: string | undefined,
    title: string,
    options?: ToastOptions
) {
    return manager.add({
        title,
        type,
        description: options?.description,
        timeout: options?.duration,
        actionProps: options?.actionProps,
        data: { createdAt: Date.now() },
    })
}
export const t = Object.assign(
    (...args: ToastArgs) => add(undefined, ...args),
    {
        success: (...args: ToastArgs) => add("success", ...args),
        error: (...args: ToastArgs) => add("error", ...args),
        info: (...args: ToastArgs) => add("info", ...args),
        warning: (...args: ToastArgs) => add("warning", ...args),
    }
)
