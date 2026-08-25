import { createApp, removeApp, rotateApp, setAppActive, updateApp } from "./fnc"
import { useAppMutation } from "@infra/ui/hooks"
import type { AppListData } from "./fnc"
import { consoleOptions } from "./get-app"

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
        // ["applications"] cascades to ["applications", clientId] too
        // (React Query's default prefix match), no need to invalidate both
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
            updater: (old: AppListData | undefined, variables) =>
                old
                    ? {
                          applications: old.applications.filter(
                              (a) => a.clientId !== variables.data.clientId
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
            updater: (old: AppListData | undefined, variables) =>
                old
                    ? {
                          applications: old.applications.map((a) =>
                              a.clientId === variables.data.clientId
                                  ? { ...a, disabled: !variables.data.active }
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
