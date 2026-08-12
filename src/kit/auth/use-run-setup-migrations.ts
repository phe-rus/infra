import { runSetupMigrations } from "./run-setup-migrations"
import { useAppMutation } from "@/kit/shared"

export const useRunSetupMigrations = () =>
    useAppMutation({
        mutationFn: () => runSetupMigrations(),
        errorMessage: "Could not prepare the database",
    })
