import { uploadUserImage } from "./upload-user-image"
import { useAppMutation } from "@/kit/shared"
import { usersQueryOptions } from "./users-query-options"

// invalidating ["users"] cascades to the open detail drawer's ["users", userId]
// query too (React Query's default prefix match), so no manual cache patch
// is needed here despite not knowing the versioned image URL until it lands
export const useUploadUserImage = () =>
    useAppMutation({
        mutationFn: uploadUserImage,
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "Image updated",
        errorMessage: "Could not update image",
    })
