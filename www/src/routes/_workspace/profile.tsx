import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { cn } from "@infra/ui/lib/utils"
import { currentOptions } from "@/functions/get-auth"
import { useUpdateProfile } from "@/functions/use-auth"
import { PersonalInfo } from "@/features/personal-info"

export const Route = createFileRoute("/_workspace/profile")({
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = useSuspenseQuery(currentOptions())
    const { mutateAsync: handleUpdate } = useUpdateProfile()

    return (
        <article
            className={cn("container mx-auto flex w-full flex-col", "gap-5 py-20 md:max-w-3xl")}
        >
            <section>
                <h1 className="text-3xl md:text-4xl">Personal info</h1>
                <p className="text-muted-foreground">Manage your account details</p>
            </section>

            <section>
                <PersonalInfo data={data} onUpdate={handleUpdate} />
            </section>
        </article>
    )
}
