import { useApplications } from "@/kit/hypermedia/applications"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

function logoUrl(logoKey: string): string {
    return `/api/auth/objects/download?key=${encodeURIComponent(logoKey)}`
}

const STATUS_COLOR: Record<string, string> = {
    verified: "bg-green-500",
    unverified: "bg-red-500",
    locked: "bg-amber-500",
}

export function ApplicationGrid() {
    const { data } = useApplications()

    if (data.applications.length === 0) {
        return <p className="text-sm text-muted-foreground">No applications yet.</p>
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {data.applications.map((app) => (
                <Link
                    key={app.id}
                    to="/database"
                    className={cn(
                        "flex items-center gap-3 rounded-2xl bg-card p-4",
                        "hover:bg-accent transition-colors"
                    )}
                >
                    <Avatar size="lg" className="shrink-0">
                        {app.logoKey && <AvatarImage src={logoUrl(app.logoKey)} alt="" />}
                        <AvatarFallback>{app.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-sm font-medium">{app.name}</span>
                        <code className="truncate text-xs text-muted-foreground">{app.identifier}</code>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{app.type}</Badge>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className={cn("size-2 rounded-full", STATUS_COLOR[app.status])} />
                                {app.status}
                            </span>
                            {!app.active && <Badge variant="destructive">Disabled</Badge>}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
