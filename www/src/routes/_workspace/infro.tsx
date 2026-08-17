import { PersonalInfo } from "@/features/personal-info"
import { createFileRoute } from "@tanstack/react-router"
import { cn } from "@infra/ui/lib/utils"

export const Route = createFileRoute("/_workspace/infro")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <article className={cn(
            'container mx-auto flex w-full flex-col',
            'gap-5 py-20 md:max-w-3xl'
        )}>
            <section>
                <h1 className="text-3xl md:text-4xl">Personal info</h1>
                <p className="text-muted-foreground">Manage your account details</p>
            </section>

            <section>
                <PersonalInfo />
            </section>
        </article>
    )
}
