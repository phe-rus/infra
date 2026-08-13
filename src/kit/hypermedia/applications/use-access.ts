import { rotateApplication, setApplicationActive } from "./fnc"
import { useAppMutation } from "@/kit/shared"
import type { ApplicationsListData } from "@/kit/types"
import { applicationsQueryOptions } from "./get-applications"

export const useSetApplicationActive = () =>
    useAppMutation({
        mutationFn: setApplicationActive,
        invalidates: [applicationsQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: applicationsQueryOptions().queryKey,
            updater: (old: ApplicationsListData | undefined, variables) =>
                old
                    ? {
                          applications: old.applications.map((a) =>
                              a.id === variables.data.applicationId ? { ...a, active: variables.data.active } : a
                          ),
                      }
                    : { applications: [] },
        },
        successMessage: "Application updated",
        errorMessage: "Could not update application",
    })

export const useRotateApplication = () =>
    useAppMutation({
        mutationFn: rotateApplication,
        invalidates: [applicationsQueryOptions().queryKey],
        successMessage: "Secret rotated",
        errorMessage: "Could not rotate secret",
    })
