import { useConsole } from "@/kit/console"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FrameworkIcon } from "@/components/widgets/framework-icon"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

export function ApplicationGrid() {
    const { data } = useConsole()

    if (data.applications.length === 0) {
        return <p className="text-sm text-muted-foreground">No applications yet.</p>
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {data.applications.map((app) => (
                <Link
                    key={app.id}
                    to="/console/$client_id"
                    params={{ client_id: app.clientId }}
                    className={cn(
                        "flex gap-3 rounded-lg bg-card p-4",
                        "hover:bg-accent transition-colors"
                    )}
                >
                    <Avatar size='sm' className="shrink-0">
                        <AvatarFallback>
                            {app.framework ? (
                                <FrameworkIcon framework={app.framework} className="size-4" />
                            ) : (
                                (app.name ?? "?").slice(0, 1).toUpperCase()
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <h4 className="truncate font-medium">{app.name ?? "Untitled"}</h4>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">{app.type}</span>
                            <span className="text-xs text-muted-foreground"> • </span>
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
