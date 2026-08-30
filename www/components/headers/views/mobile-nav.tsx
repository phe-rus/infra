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
            swipeDirection='left'
            open={open}
            onOpenChange={onOpenChange}
            title="Quick navigation"
            description="Quick navigation between pages"
        >
            <nav className="flex flex-col">
                {config.map((item, idx) => {
                    if (isNavGroup(item)) {
                        return (
                            <div
                                key={idx}
                                className="flex flex-col mb-1"
                            >
                                <span className="text-base font-medium text-muted-foreground">
                                    {item.label}
                                </span>
                                <div className='flex flex-col'>
                                    {item.items.map((section, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col gap-1 pl-3"
                                        >
                                            <span className={cn(
                                                "text-sm text-muted-foreground/70 pb-1",
                                                index === 0 ? "pt-2" : "pt-5"
                                            )}>
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
                                                            "text-sm transition-colors"
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
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={idx}
                            to={item.to}
                            onClick={close}
                            className={cn(
                                "text-base transition-colors"
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
