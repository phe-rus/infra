import { deleteObject } from "./delete-object"
import { useAppMutation } from "@/kit/shared"

export const useDeleteObject = () =>
    useAppMutation({
        mutationFn: deleteObject,
        invalidates: [["objects", "browse"]],
        successMessage: "Deleted",
        errorMessage: "Could not delete",
    })
