import { useSuspenseQuery } from "@tanstack/react-query"
import { useAppMutation } from "@infra/ui/hooks"
import {
    updateInstanceSettings,
    uploadInstanceFavicon,
    uploadInstanceLogo,
} from "./func"
import { instanceSettingsOptions } from "./get-settings"

export const useInstanceSettings = () =>
    useSuspenseQuery(instanceSettingsOptions())

export const useUpdateInstanceSettings = () =>
    useAppMutation({
        mutationFn: updateInstanceSettings,
        invalidates: [["instance-settings"]],
        successMessage: "Settings saved",
        errorMessage: "Could not save settings",
    })

export const useUploadInstanceLogo = () =>
    useAppMutation({
        mutationFn: uploadInstanceLogo,
        invalidates: [],
        errorMessage: "Could not upload the logo",
    })

export const useUploadInstanceFavicon = () =>
    useAppMutation({
        mutationFn: uploadInstanceFavicon,
        invalidates: [],
        errorMessage: "Could not upload the favicon",
    })
