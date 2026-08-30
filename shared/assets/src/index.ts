import {
    createAuthEndpoint,
    sessionMiddleware,
    APIError,
} from "better-auth/api"
import * as z from "zod"
import {
    ALLOWED_TYPES,
    MAX_FILE_BYTES,
    MAX_USER_QUOTA_BYTES,
} from "./constants"
import { sniffExtension, isImageExtension } from "./sniff-file-type"
import { sanitizeSvg } from "./sanitize-svg"
import {
    avatarKey,
    avatarPrefix,
    fileKey,
    getUserUsageBytes,
    listAllObjects,
    stripExtension,
} from "./r2-paths"
import { cdnPath, cdnUrl } from "./cdn-url"

export { cdnPath, cdnUrl }

function readUploadedFile(body: unknown): File {
    const file = (body as Record<string, unknown> | undefined)?.file
    if (!(file instanceof File)) {
        throw new APIError("BAD_REQUEST", {
            message: "No file provided",
        })
    }
    if (file.size > MAX_FILE_BYTES) {
        throw new APIError("BAD_REQUEST", {
            message: `File too large, max ${MAX_FILE_BYTES} bytes`,
        })
    }
    return file
}

function resolveTargetUserId(
    ctx: {
        body: unknown
        context: {
            session: { user: { id: string; role?: string | null } }
        }
    },
    isAdmin: (role: string) => boolean
): string {
    const requested = (ctx.body as Record<string, unknown> | undefined)
        ?.userId
    if (
        typeof requested !== "string" ||
        requested.length === 0 ||
        requested === ctx.context.session.user.id
    ) {
        return ctx.context.session.user.id
    }
    if (!isAdmin(ctx.context.session.user.role ?? "")) {
        throw new APIError("FORBIDDEN", {
            message:
                "Admin access required to change another user's image",
        })
    }
    return requested
}

async function sniffAndValidate(file: File) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const ext = sniffExtension(bytes)
    if (!ext) {
        throw new APIError("BAD_REQUEST", {
            message: "Unrecognized or disallowed file type",
        })
    }
    const contentType = ALLOWED_TYPES[ext]
    if (ext === "svg") {
        const sanitized = await sanitizeSvg(new TextDecoder().decode(bytes))
        return {
            ext,
            contentType,
            bytes: new TextEncoder().encode(sanitized),
        }
    }
    return { ext, contentType, bytes }
}

export type AssetsProviderOptions = {
    /** The R2 bucket binding this instance reads/writes to. */
    binding: R2Bucket
    /** Whether a given role has admin-tier access — the caller's own role model, not assumed here. */
    isAdmin: (role: string) => boolean
}

export function assets(options: AssetsProviderOptions) {
    const { binding, isAdmin } = options
    return {
        id: "assets",
        endpoints: {
            uploadAvatar: createAuthEndpoint(
                "/assets/avatar",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    metadata: {
                        allowedMediaTypes: ["multipart/form-data"],
                    },
                    body: z.object({
                        file: z.instanceof(File),
                        userId: z.string().optional(),
                    }),
                },
                async (ctx) => {
                    const userId = resolveTargetUserId(ctx, isAdmin)
                    const file = readUploadedFile(ctx.body)
                    const { ext, contentType, bytes } =
                        await sniffAndValidate(file)
                    if (!isImageExtension(ext)) {
                        throw new APIError("BAD_REQUEST", {
                            message: "Avatar must be an image",
                        })
                    }

                    const [usage, existingAvatarObjects] =
                        await Promise.all([
                            getUserUsageBytes(binding, userId),
                            listAllObjects(
                                binding,
                                avatarPrefix(userId)
                            ),
                        ])
                    const existingAvatarSize =
                        existingAvatarObjects.reduce(
                            (sum, obj) => sum + obj.size,
                            0
                        )
                    const projectedUsage =
                        usage - existingAvatarSize + bytes.byteLength
                    if (projectedUsage > MAX_USER_QUOTA_BYTES) {
                        throw new APIError("BAD_REQUEST", {
                            message: "Storage quota exceeded",
                        })
                    }

                    for (const obj of existingAvatarObjects) {
                        await binding.delete(obj.key)
                    }
                    const key = avatarKey(userId, ext)
                    await binding.put(key, bytes, {
                        httpMetadata: { contentType },
                    })

                    const version = Date.now()
                    const path = cdnPath(key, version)
                    await ctx.context.internalAdapter.updateUser(
                        userId,
                        { image: path }
                    )

                    return ctx.json({ url: path })
                }
            ),
            uploadFile: createAuthEndpoint(
                "/assets/upload",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    metadata: {
                        allowedMediaTypes: ["multipart/form-data"],
                    },
                },
                async (ctx) => {
                    const userId = ctx.context.session.user.id
                    const file = readUploadedFile(ctx.body)
                    const { ext, bytes, contentType } =
                        await sniffAndValidate(file)

                    const usage = await getUserUsageBytes(
                        binding,
                        userId
                    )
                    if (
                        usage + bytes.byteLength >
                        MAX_USER_QUOTA_BYTES
                    ) {
                        throw new APIError("BAD_REQUEST", {
                            message: "Storage quota exceeded",
                        })
                    }

                    const filename = `${stripExtension(file.name || "file")}.${ext}`
                    const key = fileKey(userId, filename)
                    await binding.put(key, bytes, {
                        httpMetadata: { contentType },
                    })

                    return ctx.json({
                        key,
                        filename,
                        size: bytes.byteLength,
                    })
                }
            ),
            listObjects: createAuthEndpoint(
                "/assets/list",
                {
                    method: "GET",
                    use: [sessionMiddleware],
                    query: z.object({ prefix: z.string().optional() }),
                },
                async (ctx) => {
                    if (!isAdmin(ctx.context.session.user.role ?? "")) {
                        throw new APIError("FORBIDDEN", {
                            message: "Admin access required",
                        })
                    }
                    const prefix = ctx.query.prefix ?? ""
                    const result = await binding.list({
                        prefix,
                        delimiter: "/",
                        include: ["httpMetadata"],
                    })

                    return ctx.json({
                        prefix,
                        folders: result.delimitedPrefixes.map(
                            (folder) => ({
                                key: folder,
                                name: folder
                                    .slice(prefix.length)
                                    .replace(/\/$/, ""),
                            })
                        ),
                        files: result.objects.map((obj) => ({
                            key: obj.key,
                            name: obj.key.slice(prefix.length),
                            size: obj.size,
                            uploadedAt: obj.uploaded,
                            contentType:
                                obj.httpMetadata?.contentType ?? null,
                        })),
                    })
                }
            ),
            // single file, multiple files, or a whole folder (prefix) — all
            // through one endpoint. Admins can delete anything; a plain
            // user can only delete keys under their own userId/ prefix
            // (covers what used to be the separate self-service
            // files/delete endpoint)
            deleteObjects: createAuthEndpoint(
                "/assets/delete",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    body: z.object({
                        keys: z.array(z.string().min(1)).optional(),
                        prefix: z.string().min(1).optional(),
                    }),
                },
                async (ctx) => {
                    if (!ctx.body.keys?.length && !ctx.body.prefix) {
                        throw new APIError("BAD_REQUEST", {
                            message: "Provide keys or prefix",
                        })
                    }
                    const callerIsAdmin = isAdmin(
                        ctx.context.session.user.role ?? ""
                    )
                    const ownPrefix = `${ctx.context.session.user.id}/`

                    if (
                        !callerIsAdmin &&
                        ctx.body.prefix &&
                        !ctx.body.prefix.startsWith(ownPrefix)
                    ) {
                        throw new APIError("FORBIDDEN", {
                            message: "Admin access required",
                        })
                    }

                    const targetKeys = ctx.body.prefix
                        ? (
                              await listAllObjects(
                                  binding,
                                  ctx.body.prefix
                              )
                          ).map((obj) => obj.key)
                        : (ctx.body.keys ?? [])

                    if (
                        !callerIsAdmin &&
                        targetKeys.some(
                            (key) => !key.startsWith(ownPrefix)
                        )
                    ) {
                        throw new APIError("FORBIDDEN", {
                            message: "Admin access required",
                        })
                    }

                    for (let i = 0; i < targetKeys.length; i += 1000) {
                        await binding.delete(
                            targetKeys.slice(i, i + 1000)
                        )
                    }
                    return ctx.json({
                        success: true,
                        deleted: targetKeys.length,
                    })
                }
            ),
        },
    }
}
