import { useRef } from "react"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@infra/ui/components/avatar"
import { Button } from "@infra/ui/components/button"
import { t } from "@infra/ui/components/sonner"
import { authClient } from "@/lib/auth-client"
import { currentOptions } from "@/functions/get-auth"

export function AvatarUpload() {
    const queryClient = useQueryClient()
    const { data: session } = useSuspenseQuery(currentOptions())
    const user = session?.user
    const fileInputRef = useRef<HTMLInputElement>(null)

    const uploadAvatar = useMutation({
        mutationFn: (file: File) => authClient.r2.uploadAvatar(file),
        onSuccess: async ({ error }) => {
            if (error) {
                t.error(error.message ?? "Could not upload avatar")
                return
            }
            await queryClient.invalidateQueries(currentOptions())
        },
        onError: (error) => {
            t.error(error.message ?? "Could not upload avatar")
        },
    })

    return (
        <div className="flex items-center gap-4">
            <Avatar size="lg">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
                <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/webp,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadAvatar.mutate(file)
                }}
            />
            <Button
                type="button"
                variant="outline"
                size="sm"
                isDisabled={uploadAvatar.isPending}
                onClick={() => fileInputRef.current?.click()}
            >
                {uploadAvatar.isPending ? "Uploading…" : "Change avatar"}
            </Button>
        </div>
    )
}
