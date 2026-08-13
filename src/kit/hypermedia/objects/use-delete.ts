import { deleteFolder, deleteObject } from "./fnc"
import { useAppMutation } from "@/kit/shared"

export const useDeleteObject = () =>
    useAppMutation({
        mutationFn: deleteObject,
        invalidates: [["objects", "browse"]],
        successMessage: "Deleted",
        errorMessage: "Could not delete",
    })

export const useDeleteFolder = () =>
    useAppMutation({
        mutationFn: deleteFolder,
        invalidates: [["objects", "browse"]],
        successMessage: "Folder deleted",
        errorMessage: "Could not delete folder",
    })
