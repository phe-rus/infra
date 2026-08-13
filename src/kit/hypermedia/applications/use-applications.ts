import { createApplication, removeApplication, uploadApplicationLogo } from "./fnc"
import { useAppMutation } from "@/kit/shared"
import type { ApplicationsListData } from "@/kit/types"
import { applicationsQueryOptions } from "./get-applications"

export const useCreateApplication = () =>
    useAppMutation({
        mutationFn: createApplication,
        invalidates: [applicationsQueryOptions().queryKey],
        successMessage: "Application added",
        errorMessage: "Could not add application",
    })

export const useRemoveApplication = () =>
    useAppMutation({
        mutationFn: removeApplication,
        invalidates: [applicationsQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: applicationsQueryOptions().queryKey,
            updater: (old: ApplicationsListData | undefined, variables) =>
                old
                    ? { applications: old.applications.filter((a) => a.id !== variables.data.applicationId) }
                    : { applications: [] },
        },
        successMessage: "Application removed",
        errorMessage: "Could not remove application",
    })

export const useUploadApplicationLogo = () =>
    useAppMutation({
        mutationFn: uploadApplicationLogo,
        invalidates: [applicationsQueryOptions().queryKey],
        successMessage: "Logo updated",
        errorMessage: "Could not update logo",
    })
