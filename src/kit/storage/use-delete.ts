import { deleteObjects } from "./fnc"
import { useAppMutation } from "@/kit/shared"

export const useDeleteObjects = () =>
    useAppMutation({
        mutationFn: deleteObjects,
        invalidates: [["objects", "list"]],
        successMessage: "Deleted",
        errorMessage: "Could not delete",
    })
