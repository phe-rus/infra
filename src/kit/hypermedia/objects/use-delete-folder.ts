import { deleteFolder } from "./delete-folder"
import { useAppMutation } from "@/kit/shared"

export const useDeleteFolder = () =>
    useAppMutation({
        mutationFn: deleteFolder,
        invalidates: [["objects", "browse"]],
        successMessage: "Folder deleted",
        errorMessage: "Could not delete folder",
    })
