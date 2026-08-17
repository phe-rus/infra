import type { FC } from "react"
import { Button } from "@infra/ui/components/button"
import { useRunSetupMigrations } from "@/kit/auth"
import { cn } from "@infra/ui/lib/utils"
import { IconLoader2 } from "@tabler/icons-react"

export type RunSetupMigrationsProps = {
    onInitialized: () => void
}

export const RunSetupMigrations: FC<RunSetupMigrationsProps> = ({
    onInitialized
}) => {
    const {
        mutateAsync: runMigrations,
        isPending: migrating
    } = useRunSetupMigrations()

    async function handleInitialize() {
        await runMigrations()
        onInitialized()
    }

    return (
        <div className={cn("flex w-full md:max-w-md flex-col gap-5", "container m-auto py-10")}>
            <section>
                <h1 className="text-3xl">Infra</h1>
                <p className="text-muted-foreground">Set up your instance</p>
            </section>
            <p className="text-sm text-muted-foreground">
                This instance hasn't been initialized yet. This prepares the database and only needs
                to run once.
            </p>
            <Button
                type="button"
                isDisabled={migrating}
                onClick={() => void handleInitialize()}
            >
                {migrating && <IconLoader2 className="animate-spin" />}
                {migrating ? "Initializing…" : "Initialize"}
            </Button>
        </div>
    )
}
