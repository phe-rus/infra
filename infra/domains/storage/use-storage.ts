import { useQuery } from "@tanstack/react-query"
import { deleteObjects } from "./func"
import { listOptions } from "./get-storage"
import { useAppMutation } from "@infra/ui/hooks"

export const useListObjects = (prefix: string) => useQuery(listOptions(prefix))

export const useDeleteObjects = () =>
    useAppMutation({
        mutationFn: deleteObjects,
        invalidates: [["objects", "list"]],
        successMessage: "Deleted",
        errorMessage: "Could not delete",
    })
