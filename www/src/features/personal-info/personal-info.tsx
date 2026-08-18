import type { FC } from "react"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { useSelector } from "@tanstack/react-store"
import { formatUtc } from "@infra/ui/lib/date"
import { resolveCdnUrl } from "@/lib/auth-client"
import { profileSchema, type useUpdateProfile } from "@/functions/use-auth"
import type { ProfileFormValues } from "@/functions/use-auth"
import type { CurrentUserData } from "@/functions/get-auth"

type PersonalInfoProps = {
    data: CurrentUserData
    onUpdate: ReturnType<typeof useUpdateProfile>["mutateAsync"]
}

export const PersonalInfo: FC<PersonalInfoProps> = ({ data, onUpdate }) => {
    const user = data?.user

    const defaultValue: ProfileFormValues = {
        name: user?.name ?? "",
        bio: user?.bio ?? "",
        avatar: null,
        email: user?.email ?? "",
        id: user?.id ?? "",
        role: user?.role ?? "",
        createdAt: formatUtc(String(user?.createdAt), "PPP"),
        updatedAt: formatUtc(String(user?.updatedAt), "PPP"),
        emailVerified: String(user?.emailVerified),
    }

    const form = useAppForm({
        defaultValues: defaultValue,
        validators: {
            onChange: profileSchema,
            onSubmit: profileSchema,
            onMount: profileSchema,
            onBlur: profileSchema,
        },
        onSubmit: async ({ value }) => {
            await onUpdate({ value, original: defaultValue })
            form.reset()
        },
    })

    const vals = useSelector(form.store, (s) => s.values)

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            className="flex flex-col gap-5 md:max-w-md"
        >
            <form.AppForm>
                <form.AppField
                    name="avatar"
                    children={(field) => (
                        <field.avatar
                            label={user?.name ?? ""}
                            existingImage={resolveCdnUrl(user?.image)}
                        />
                    )}
                />

                <FieldGroup>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col">
                            <h2>Basics</h2>
                            <p className="text-sm">The basics of you</p>
                        </div>
                        <form.AppField
                            name="name"
                            children={(field) => (
                                <field.input label="Name" placeholder="Your name" />
                            )}
                        />

                        <form.AppField
                            name="bio"
                            children={(field) => (
                                <field.textarea label="Bio" placeholder="A short bio" />
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col">
                            <h2>Credentials</h2>
                            <p className="text-sm md:max-w-md">
                                This are protected from being changed and only happen automatically
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 truncate">
                            {vals.email && (
                                <div>
                                    <h3 className="text-sm">Email</h3>
                                    <p className="text-sm">{vals.email}</p>
                                </div>
                            )}

                            {vals.role && (
                                <div>
                                    <h3 className="text-sm">Role</h3>
                                    <p className="text-sm">{vals.role}</p>
                                </div>
                            )}

                            {vals.createdAt && (
                                <div>
                                    <h3 className="text-sm">Created At</h3>
                                    <p className="text-sm">{vals.createdAt}</p>
                                </div>
                            )}

                            {vals.updatedAt && (
                                <div>
                                    <h3 className="text-sm">Updated At</h3>
                                    <p className="text-sm">{vals.updatedAt}</p>
                                </div>
                            )}

                            {vals.emailVerified && (
                                <div>
                                    <h3 className="text-sm">Email Verified</h3>
                                    <p className="text-sm">{vals.emailVerified}</p>
                                </div>
                            )}

                            {vals.id && (
                                <div>
                                    <h3 className="text-sm">ID</h3>
                                    <p className="text-sm">{vals.id}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </FieldGroup>

                <form.submit label="Save changes" />
            </form.AppForm>
        </form>
    )
}
