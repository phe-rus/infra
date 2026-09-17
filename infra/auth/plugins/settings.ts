import {
    APIError,
    createAuthEndpoint,
    sessionMiddleware,
} from "better-auth/api"
import type { BetterAuthPlugin } from "better-auth"
import * as z from "zod"
import { cdnPath } from "@infra/assets/server"

export type InstanceSettingsView = {
    displayName: string
    logoUrl: string | null
    faviconUrl: string | null
    supportEmail: string | null
}

export type InstanceSettingsOptions = {
    /** Falls back to this when no instance name has ever been set. */
    appName: string
    /** The caller's own role model, not assumed here, same shape as @infra/assets. */
    isAdmin: (role: string) => boolean
    /** The R2 bucket instance branding assets (logo/favicon) live in. */
    binding: R2Bucket
}

type InstanceSettingsRow = {
    id: string
    displayName: string | null
    logoKey: string | null
    faviconKey: string | null
    supportEmail: string | null
    updatedAt: Date
    updatedBy: string | null
}

const MEMO_TTL_MS = 30_000
let memo: {
    value: InstanceSettingsView
    expiresAt: number
} | null = null

function toView(
    appName: string,
    row: InstanceSettingsRow | null
): InstanceSettingsView {
    const version = row?.updatedAt?.getTime() ?? 0
    return {
        displayName: row?.displayName || appName,
        logoUrl: row?.logoKey
            ? cdnPath(row.logoKey, version)
            : null,
        faviconUrl: row?.faviconKey
            ? cdnPath(row.faviconKey, version)
            : null,
        supportEmail: row?.supportEmail || null,
    }
}

// "" and undefined both collapse to null before validation: an omitted
// field leaves the row untouched (per-field upsert below), a field sent as
// an empty string is treated the same as an explicit clear.
function emptyToNull<T extends z.ZodTypeAny>(schema: T) {
    return z
        .preprocess(
            (value) => (value === "" ? null : value),
            schema.nullable()
        )
        .optional()
}

export const updateInstanceSettingsBody = z.object({
    displayName: emptyToNull(z.string().trim()),
    supportEmail: emptyToNull(z.string().trim().email()),
    logoKey: z.string().nullable().optional(),
    faviconKey: z.string().nullable().optional(),
})

// A real better-auth plugin (mirrors @infra/assets' injected-dependency
// shape), not a domain reaching into Drizzle directly: instanceSettings is
// this plugin's own table (declared below, generated into schemas/auth.ts
// by `bun run auth:gen`, same as every better-auth-owned table), read and
// written through the adapter, callable in-process via auth.api.* the same
// way every other custom mutation in this app already goes through auth.api.
export function settings(options: InstanceSettingsOptions) {
    const { appName, isAdmin, binding } = options

    return {
        id: "settings",
        schema: {
            instanceSettings: {
                fields: {
                    displayName: {
                        type: "string",
                        required: false,
                    },
                    logoKey: {
                        type: "string",
                        required: false,
                    },
                    faviconKey: {
                        type: "string",
                        required: false,
                    },
                    supportEmail: {
                        type: "string",
                        required: false,
                    },
                    updatedAt: {
                        type: "date",
                        required: true,
                    },
                    updatedBy: {
                        type: "string",
                        required: false,
                        references: {
                            model: "user",
                            field: "id",
                        },
                    },
                },
            },
        },
        endpoints: {
            getInstanceSettings: createAuthEndpoint(
                "/settings/instance",
                { method: "GET" },
                async (ctx) => {
                    if (memo && memo.expiresAt > Date.now()) {
                        return ctx.json(memo.value)
                    }
                    let value: InstanceSettingsView
                    try {
                        const [row] =
                            await ctx.context.adapter.findMany<InstanceSettingsRow>(
                                {
                                    model: "instanceSettings",
                                    limit: 1,
                                }
                            )
                        value = toView(appName, row ?? null)
                    } catch {
                        value = toView(appName, null)
                    }
                    memo = {
                        value,
                        expiresAt: Date.now() + MEMO_TTL_MS,
                    }
                    return ctx.json(value)
                }
            ),
            updateInstanceSettings: createAuthEndpoint(
                "/settings/instance",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    body: updateInstanceSettingsBody,
                },
                async (ctx) => {
                    if (
                        !isAdmin(
                            ctx.context.session.user.role ??
                                ""
                        )
                    ) {
                        throw new APIError("FORBIDDEN", {
                            message: "Admin access required",
                        })
                    }
                    const data = ctx.body
                    const [existing] =
                        await ctx.context.adapter.findMany<InstanceSettingsRow>(
                            {
                                model: "instanceSettings",
                                limit: 1,
                            }
                        )

                    // an explicit clear (null) deletes the now unused
                    // object; a field left out of the payload (undefined)
                    // is untouched, no delete
                    if (
                        data.logoKey === null &&
                        existing?.logoKey
                    ) {
                        await binding.delete(existing.logoKey)
                    }
                    if (
                        data.faviconKey === null &&
                        existing?.faviconKey
                    ) {
                        await binding.delete(
                            existing.faviconKey
                        )
                    }

                    const patch: Record<string, unknown> = {
                        updatedBy:
                            ctx.context.session.user.id,
                        updatedAt: new Date(),
                    }
                    if (data.displayName !== undefined)
                        patch.displayName = data.displayName
                    if (data.supportEmail !== undefined)
                        patch.supportEmail = data.supportEmail
                    if (data.logoKey !== undefined)
                        patch.logoKey = data.logoKey
                    if (data.faviconKey !== undefined)
                        patch.faviconKey = data.faviconKey

                    try {
                        if (existing) {
                            await ctx.context.adapter.update({
                                model: "instanceSettings",
                                where: [
                                    {
                                        field: "id",
                                        value: existing.id,
                                    },
                                ],
                                update: patch,
                            })
                        } else {
                            await ctx.context.adapter.create({
                                model: "instanceSettings",
                                data: patch,
                            })
                        }
                    } catch (err) {
                        // a fresh upload attached to this failed save
                        // must not orphan
                        if (data.logoKey)
                            await binding.delete(data.logoKey)
                        if (data.faviconKey)
                            await binding.delete(
                                data.faviconKey
                            )
                        throw err
                    }

                    memo = null
                    const [row] =
                        await ctx.context.adapter.findMany<InstanceSettingsRow>(
                            {
                                model: "instanceSettings",
                                limit: 1,
                            }
                        )
                    const value = toView(appName, row ?? null)
                    memo = {
                        value,
                        expiresAt: Date.now() + MEMO_TTL_MS,
                    }
                    return ctx.json(value)
                }
            ),
        },
    } satisfies BetterAuthPlugin
}
