import { cn } from "@infra/ui/lib/utils"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { Link } from "@tanstack/react-router"
import { config, isNavGroup } from "../config"

type MobileNavProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function MobileNav({
    open,
    onOpenChange,
}: MobileNavProps) {
    const close = () => onOpenChange(false)

    return (
        <DialogWidget
            open={open}
            onOpenChange={onOpenChange}
            title="Quick navigation"
            description="Quick navigation between pages"
        >
            <nav className="flex flex-col gap-4">
                {config.map((item, idx) => {
                    if (isNavGroup(item)) {
                        return (
                            <div
                                key={idx}
                                className="flex flex-col gap-3"
                            >
                                <span className="text-xs font-medium text-muted-foreground">
                                    {item.label}
                                </span>
                                {item.items.map((section) => (
                                    <div
                                        key={section.label}
                                        className="flex flex-col gap-1 pl-3"
                                    >
                                        <span className="text-xs text-muted-foreground/70">
                                            {section.label}
                                        </span>
                                        {section.items.map(
                                            (leaf) => (
                                                <Link
                                                    key={
                                                        leaf.to
                                                    }
                                                    to={
                                                        leaf.to
                                                    }
                                                    onClick={
                                                        close
                                                    }
                                                    className={cn(
                                                        "text-sm py-1 transition-colors"
                                                    )}
                                                    activeProps={{
                                                        className:
                                                            "text-primary!",
                                                    }}
                                                >
                                                    {
                                                        leaf.label
                                                    }
                                                </Link>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={idx}
                            to={item.to}
                            onClick={close}
                            className={cn(
                                "text-lg transition-colors"
                            )}
                            activeProps={{
                                className: "text-primary!",
                            }}
                            activeOptions={{
                                exact: item.to === "/",
                            }}
                        >
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
        </DialogWidget>
    )
}
