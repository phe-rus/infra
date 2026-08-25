import type { FC } from "react"
import { Avatar, AvatarFallback } from "@infra/ui/components/avatar"
import { Link } from "@tanstack/react-router"
import { cn } from "@infra/ui/lib/utils"
import { FrameworkIcon } from "@/domains/console/framework-icon"
import type { AppListData } from "@/domains/console"

type ApplicationGridProps = {
    data: AppListData
}

export const ApplicationGrid: FC<ApplicationGridProps> = ({ data }) => {
    if (data.applications.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No applications yet.
            </p>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {data.applications.slice(0, 4).map((app) => (
                <Link
                    key={app.id}
                    to="/console/$client_id"
                    params={{ client_id: app.clientId }}
                    className={cn(
                        "flex gap-3 rounded-lg p-5",
                        "transition-colors hover:bg-muted/55",
                        "border border-border/35 shadow",
                        "hover:shadow-md"
                    )}
                >
                    <Avatar size="sm" className="shrink-0">
                        <AvatarFallback>
                            {app.framework ? (
                                <FrameworkIcon
                                    framework={app.framework.trim()}
                                    className="size-4"
                                />
                            ) : (
                                (app.name ?? "?").slice(0, 1).toUpperCase()
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <h4 className="truncate font-medium">
                            {app.name ?? "Untitled"}
                        </h4>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                                {app.applicationType}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {" "}
                                •{" "}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {app.disabled ? "inactive" : "active"}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
