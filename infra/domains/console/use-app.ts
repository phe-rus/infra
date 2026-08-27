import {
    createApp,
    removeApp,
    rotateApp,
    setAppActive,
    updateApp,
} from "./func"
import { useAppMutation } from "@infra/ui/hooks"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { AppListData } from "./func"
import { appOptions, consoleOptions } from "./get-console"

export const useConsole = () => useSuspenseQuery(consoleOptions())

export const useApp = (clientId: string) =>
    useSuspenseQuery(appOptions(clientId))

export const useCreateApp = () =>
    useAppMutation({
        mutationFn: createApp,
        invalidates: [consoleOptions().queryKey],
        successMessage: "Application created",
        errorMessage: "Could not create application",
    })

export const useUpdateApp = () =>
    useAppMutation({
        mutationFn: updateApp,
        invalidates: [consoleOptions().queryKey],
        successMessage: "Application saved",
        errorMessage: "Could not save application",
    })

export const useRemoveApp = () =>
    useAppMutation({
        mutationFn: removeApp,
        invalidates: [consoleOptions().queryKey],
        optimisticUpdate: {
            queryKey: consoleOptions().queryKey,
            updater: (old: AppListData | undefined, clientId: string) =>
                old
                    ? {
                          applications: old.applications.filter(
                              (a) => a.clientId !== clientId
                          ),
                      }
                    : { applications: [] },
        },
        successMessage: "Application removed",
        errorMessage: "Could not remove application",
    })

export const useSetAppActive = () =>
    useAppMutation({
        mutationFn: setAppActive,
        invalidates: [consoleOptions().queryKey],
        optimisticUpdate: {
            queryKey: consoleOptions().queryKey,
            updater: (
                old: AppListData | undefined,
                variables: { clientId: string; active: boolean }
            ) =>
                old
                    ? {
                          applications: old.applications.map((a) =>
                              a.clientId === variables.clientId
                                  ? { ...a, disabled: !variables.active }
                                  : a
                          ),
                      }
                    : { applications: [] },
        },
        successMessage: "Application updated",
        errorMessage: "Could not update application",
    })

export const useRotateApp = () =>
    useAppMutation({
        mutationFn: rotateApp,
        invalidates: [consoleOptions().queryKey],
        successMessage: "Secret rotated",
        errorMessage: "Could not rotate secret",
    })
