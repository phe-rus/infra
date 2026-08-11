import type { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type DialogWidgetProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: ReactNode
    description?: ReactNode
    children: ReactNode
    footer?: ReactNode
    swipeDirection?: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>
    className?: string
}

/**
 * The single reusable entry point for a drawer-style dialog — handles the
 * Drawer/DrawerContent/DrawerHeader wiring so a caller only supplies the
 * title/description/body/footer, the same way DataTable is the one entry
 * point for a table.
 */
export function DialogWidget({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    swipeDirection = "right",
    className,
}: DialogWidgetProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange} swipeDirection={swipeDirection}>
            <DrawerContent className={cn("bg-background", className)}>
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                    {description && <DrawerDescription>{description}</DrawerDescription>}
                </DrawerHeader>
                <div className="flex flex-col gap-3 overflow-y-auto p-4">{children}</div>
                {footer && <DrawerFooter>{footer}</DrawerFooter>}
            </DrawerContent>
        </Drawer>
    )
}
