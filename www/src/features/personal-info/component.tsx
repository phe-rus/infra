import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { t } from "@infra/ui/components/sonner"
import { authClient, resolveCdnUrl } from "@/lib/auth-client"
import { currentOptions } from "@/functions/get-auth"
import { getContext } from "@/lib/queryClient"
import { format } from "date-fns"
import { z } from "zod"

export const profileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    bio: z.string().max(280, "At most 280 characters").optional(),
    avatar: z.file().nullable(),
    email: z.email(),
    id: z.string(),
    role: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    emailVerified: z.string(),
})

export function PersonalInfo() {
    const queryClient = getContext()
    const { data } = useSuspenseQuery(currentOptions())
    const user = data?.user

    const defaultValue: z.input<typeof profileSchema> = {
        name: user?.name ?? '',
        bio: user?.bio ?? '',
        avatar: null,
        email: user?.email ?? '',
        id: user?.id ?? '',
        role: user?.role ?? '',
        createdAt: format(String(user?.createdAt), 'PPP') ?? '',
        updatedAt: format(String(user?.updatedAt), 'PPP') ?? '',
        emailVerified: String(user?.emailVerified) ?? 'false',
    }

    const {
        mutateAsync: handleUpdate
    } = useMutation({
        mutationFn: async (value: z.input<typeof profileSchema>) => {
            const changes: { name?: string; bio?: string; image?: string } = {}
            if (value.name !== defaultValue.name) changes.name = value.name
            if (value.bio !== defaultValue.bio) changes.bio = value.bio

            if (value.avatar) {
                const { data, error } = await authClient.r2.uploadAvatar(value.avatar)
                if (error) throw new Error(error.message ?? "Could not upload avatar")
                if (data?.url) changes.image = data.url
            }

            if (Object.keys(changes).length > 0) {
                return await authClient.updateUser(changes)
            }
        },
        onSuccess: () => {
            t.success("Profile updated")
            form.reset()
            void queryClient.invalidateQueries(currentOptions())
        },
        onError: (error) => {
            t.error(error.name ?? "Could not update profile", {
                description: error.message ?? "Please try again later"
            })
        }
    })

    const form = useAppForm({
        defaultValues: defaultValue,
        validators: {
            onChange: profileSchema,
            onSubmit: profileSchema,
            onMount: profileSchema,
            onBlur: profileSchema,
        },
        onSubmit: async ({ value }) => {
            await handleUpdate(value)
        }
    })

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
                    children={(field) => <field.avatar label={user?.name ?? ""} existingImage={resolveCdnUrl(user?.image)} />}
                />

                <FieldGroup>
                    <div className='flex flex-col gap-3'>
                        <div className='flex flex-col'>
                            <h2>Basics</h2>
                            <p className='text-sm'>The basics of you</p>
                        </div>
                        <form.AppField
                            name="name"
                            children={(field) => <field.input label="Name" placeholder="Your name" />}
                        />

                        <form.AppField
                            name="bio"
                            children={(field) => <field.textarea label="Bio" placeholder="A short bio" />}
                        />
                    </div>

                    <div className='flex flex-col gap-3'>
                        <div className='flex flex-col'>
                            <h2>Credentials</h2>
                            <p className='text-sm'>This are protected from being changed and only happen automatically</p>
                        </div>
                        <form.AppField
                            name='email'
                            children={(field) =>
                                <field.input
                                    disabled
                                    label="Email"
                                    placeholder="example@email.com"
                                />
                            }
                        />


                        <form.AppField
                            name='role'
                            children={(field) =>
                                <field.input
                                    disabled
                                    label="Role"
                                    placeholder="example@email.com"
                                />
                            }
                        />

                        <form.AppField
                            name="createdAt"
                            children={(field) =>
                                <field.input
                                    disabled
                                    label="Created At"
                                    placeholder="Created At"
                                />
                            }
                        />
                        <form.AppField
                            name="updatedAt"
                            children={(field) =>
                                <field.input
                                    disabled
                                    label="Updated At"
                                    placeholder="Updated At"
                                />
                            }
                        />
                        <form.AppField
                            name="emailVerified"
                            children={(field) =>
                                <field.input
                                    disabled
                                    label="Email Verified"
                                    placeholder="Email Verified"
                                />
                            }
                        />
                    </div>
                </FieldGroup>

                <form.submit label="Save changes" />
            </form.AppForm>
        </form>
    )
}
