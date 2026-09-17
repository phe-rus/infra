import type { FC } from "react"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import type { FieldAvatarValue } from "@infra/ui/widgets/blocks"
import { useBlocker } from "@tanstack/react-router"
import {
    useInstanceSettings,
    useUpdateInstanceSettings,
    useUploadInstanceFavicon,
    useUploadInstanceLogo,
} from "@/domains/settings"

// Maps a field's tri-state value to what updateInstanceSettings expects:
// untouched (null) is omitted from the payload entirely (server leaves it
// alone), explicitly cleared (false) becomes a real null, and a picked File
// gets uploaded first, its resulting key sent instead.
async function resolveAssetValue(
    value: FieldAvatarValue,
    upload: (file: File) => Promise<{ key: string }>
): Promise<string | null | undefined> {
    if (value === null) return undefined
    if (value === false) return null
    const { key } = await upload(value)
    return key
}

export const SettingsForm: FC = () => {
    const { data: settings } = useInstanceSettings()
    const {
        mutateAsync: updateSettings,
        isPending: isSaving,
    } = useUpdateInstanceSettings()
    const { mutateAsync: uploadLogo } =
        useUploadInstanceLogo()
    const { mutateAsync: uploadFavicon } =
        useUploadInstanceFavicon()

    const form = useAppForm({
        defaultValues: {
            displayName: settings.displayName,
            supportEmail: settings.supportEmail ?? "",
            logo: null as FieldAvatarValue,
            favicon: null as FieldAvatarValue,
        },
        onSubmit: async ({ value }) => {
            const [logoKey, faviconKey] = await Promise.all([
                resolveAssetValue(value.logo, (file) => {
                    const formData = new FormData()
                    formData.set("file", file)
                    return uploadLogo({ data: formData })
                }),
                resolveAssetValue(value.favicon, (file) => {
                    const formData = new FormData()
                    formData.set("file", file)
                    return uploadFavicon({ data: formData })
                }),
            ])
            await updateSettings({
                data: {
                    displayName: value.displayName,
                    supportEmail: value.supportEmail,
                    ...(logoKey !== undefined && {
                        logoKey,
                    }),
                    ...(faviconKey !== undefined && {
                        faviconKey,
                    }),
                },
            })
            form.reset({
                displayName: value.displayName,
                supportEmail: value.supportEmail,
                logo: null,
                favicon: null,
            })
        },
    })

    // A real navigation guard, not just a visual hint: leaving with unsaved
    // changes (an in-app link, back button, or closing/refreshing the tab)
    // prompts for confirmation instead of silently discarding the edit.
    useBlocker({
        shouldBlockFn: () => form.state.isDirty,
        enableBeforeUnload: () => form.state.isDirty,
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            className="flex flex-col gap-8"
        >
            <form.AppForm>
                <div className="flex flex-wrap gap-8">
                    <form.AppField
                        name="logo"
                        children={(field) => (
                            <field.avatar
                                label="Logo"
                                existingImage={
                                    settings.logoUrl
                                }
                                clearable
                            />
                        )}
                    />

                    <form.AppField
                        name="favicon"
                        children={(field) => (
                            <field.avatar
                                label="Favicon"
                                existingImage={
                                    settings.faviconUrl ??
                                    "/favicon.svg"
                                }
                                clearable
                            />
                        )}
                    />
                </div>

                <FieldGroup>
                    <form.AppField
                        name="displayName"
                        children={(field) => (
                            <field.input
                                label="Instance name"
                                placeholder="Infra"
                            />
                        )}
                    />

                    <form.AppField
                        name="supportEmail"
                        children={(field) => (
                            <field.input
                                label="Support email"
                                type="email"
                                placeholder="support@example.com"
                            />
                        )}
                    />
                </FieldGroup>

                {form.state.isDirty && (
                    <p className="text-xs text-muted-foreground">
                        You have unsaved changes.
                    </p>
                )}

                <form.submit
                    label={isSaving ? "Saving…" : "Save"}
                />
            </form.AppForm>
        </form>
    )
}
