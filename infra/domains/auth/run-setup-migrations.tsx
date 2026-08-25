import type { FC } from "react"
import { Button } from "@infra/ui/components/button"
import { useRunSetupMigrations } from "@/domains/auth"
import { ViewController } from "@/components/views"
import { IconLoader2 } from "@tabler/icons-react"

export type RunSetupMigrationsProps = {
    onInitialized: () => void
}

export const RunSetupMigrations: FC<RunSetupMigrationsProps> = ({ onInitialized }) => {
    const { mutateAsync: runMigrations, isPending: migrating } = useRunSetupMigrations()

    async function handleInitialize() {
        await runMigrations()
        onInitialized()
    }

    return (
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title="Infra"
                    description="Set up your instance"
                />
            }
        >
            <p className="text-sm text-muted-foreground">
                This instance hasn't been initialized yet. This prepares the database and only needs
                to run once.
            </p>
            <Button type="button" isDisabled={migrating} onClick={() => void handleInitialize()}>
                {migrating && <IconLoader2 className="animate-spin" />}
                {migrating ? "Initializing…" : "Initialize"}
            </Button>
        </ViewController>
    )
}
