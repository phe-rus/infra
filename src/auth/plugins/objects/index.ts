import { env } from "cloudflare:workers"
import { createAuthEndpoint, sessionMiddleware, APIError } from "better-auth/api"
import * as z from "zod"
import { isAdminTier } from "@/auth/permissions"
import { ALLOWED_TYPES, MAX_FILE_BYTES, MAX_USER_QUOTA_BYTES } from "./constants"
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

function readUploadedFile(body: unknown): File {
    const file = (body as Record<string, unknown> | undefined)?.file
    if (!(file instanceof File)) {
        throw new APIError("BAD_REQUEST", { message: "No file provided" })
    }
    if (file.size > MAX_FILE_BYTES) {
        throw new APIError("BAD_REQUEST", { message: `File too large, max ${MAX_FILE_BYTES} bytes` })
    }
    return file
}

async function sniffAndValidate(file: File) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const ext = sniffExtension(bytes)
    if (!ext) {
        throw new APIError("BAD_REQUEST", { message: "Unrecognized or disallowed file type" })
    }
    const contentType = ALLOWED_TYPES[ext]
    if (ext === "svg") {
        const sanitized = sanitizeSvg(new TextDecoder().decode(bytes))
        return { ext, contentType, bytes: new TextEncoder().encode(sanitized) }
    }
    return { ext, contentType, bytes }
}

function avatarUrl(userId: string, version: number): string {
    const base = env.BETTER_AUTH_URL ?? ""
    return `${base}/api/auth/objects/avatar/${userId}?v=${version}`
}

export function objects() {
    return {
        id: "objects",
        endpoints: {
            uploadAvatar: createAuthEndpoint(
                "/objects/avatar",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    metadata: { allowedMediaTypes: ["multipart/form-data"] },
                },
                async (ctx) => {
                    const userId = ctx.context.session.user.id
                    const file = readUploadedFile(ctx.body)
                    const { ext, contentType, bytes } = await sniffAndValidate(file)
                    if (!isImageExtension(ext)) {
                        throw new APIError("BAD_REQUEST", { message: "Avatar must be an image" })
                    }

                    const bucket = env.STORAGE
                    const [usage, existingAvatarObjects] = await Promise.all([
                        getUserUsageBytes(bucket, userId),
                        listAllObjects(bucket, avatarPrefix(userId)),
                    ])
                    const existingAvatarSize = existingAvatarObjects.reduce((sum, obj) => sum + obj.size, 0)
                    const projectedUsage = usage - existingAvatarSize + bytes.byteLength
                    if (projectedUsage > MAX_USER_QUOTA_BYTES) {
                        throw new APIError("BAD_REQUEST", { message: "Storage quota exceeded" })
                    }

                    for (const obj of existingAvatarObjects) {
                        await bucket.delete(obj.key)
                    }
                    await bucket.put(avatarKey(userId, ext), bytes, { httpMetadata: { contentType } })

                    const version = Date.now()
                    const url = avatarUrl(userId, version)
                    await ctx.context.internalAdapter.updateUser(userId, { image: url })

                    return ctx.json({ url })
                }
            ),
            uploadFile: createAuthEndpoint(
                "/objects/files",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    metadata: { allowedMediaTypes: ["multipart/form-data"] },
                },
                async (ctx) => {
                    const userId = ctx.context.session.user.id
                    const file = readUploadedFile(ctx.body)
                    const { ext, bytes } = await sniffAndValidate(file)

                    const bucket = env.STORAGE
                    const usage = await getUserUsageBytes(bucket, userId)
                    if (usage + bytes.byteLength > MAX_USER_QUOTA_BYTES) {
                        throw new APIError("BAD_REQUEST", { message: "Storage quota exceeded" })
                    }

                    const filename = `${stripExtension(file.name || "file")}.${ext}`
                    const key = fileKey(userId, filename)
                    await bucket.put(key, bytes, { httpMetadata: { contentType: ALLOWED_TYPES[ext] } })

                    return ctx.json({ filename, size: bytes.byteLength })
                }
            ),
            deleteFile: createAuthEndpoint(
                "/objects/files/delete",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    body: z.object({ filename: z.string().min(1) }),
                },
                async (ctx) => {
                    const userId = ctx.context.session.user.id
                    await env.STORAGE.delete(fileKey(userId, ctx.body.filename))
                    return ctx.json({ success: true })
                }
            ),
            browseObjects: createAuthEndpoint(
                "/objects/browse",
                {
                    method: "GET",
                    use: [sessionMiddleware],
                    query: z.object({ prefix: z.string().optional() }),
                },
                async (ctx) => {
                    if (!isAdminTier(ctx.context.session.user.role ?? "")) {
                        throw new APIError("FORBIDDEN", { message: "Admin access required" })
                    }
                    const prefix = ctx.query.prefix ?? ""
                    const result = await env.STORAGE.list({ prefix, delimiter: "/", include: ["httpMetadata"] })

                    return ctx.json({
                        prefix,
                        folders: result.delimitedPrefixes.map((folder) => ({
                            key: folder,
                            name: folder.slice(prefix.length).replace(/\/$/, ""),
                        })),
                        files: result.objects.map((obj) => ({
                            key: obj.key,
                            name: obj.key.slice(prefix.length),
                            size: obj.size,
                            uploadedAt: obj.uploaded,
                            contentType: obj.httpMetadata?.contentType ?? null,
                        })),
                    })
                }
            ),
            downloadFile: createAuthEndpoint(
                "/objects/download",
                {
                    method: "GET",
                    use: [sessionMiddleware],
                    query: z.object({ key: z.string().min(1) }),
                },
                async (ctx) => {
                    if (!isAdminTier(ctx.context.session.user.role ?? "")) {
                        throw new APIError("FORBIDDEN", { message: "Admin access required" })
                    }
                    const object = await env.STORAGE.get(ctx.query.key)
                    if (!object) {
                        return new Response(null, { status: 404 })
                    }
                    return new Response(object.body, {
                        headers: {
                            "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
                        },
                    })
                }
            ),
            getAvatar: createAuthEndpoint(
                "/objects/avatar/:userId",
                { method: "GET" },
                async (ctx) => {
                    const objectsForUser = await listAllObjects(env.STORAGE, avatarPrefix(ctx.params.userId))
                    const avatarObject = objectsForUser[0]
                    if (!avatarObject) {
                        return new Response(null, { status: 404 })
                    }
                    const object = await env.STORAGE.get(avatarObject.key)
                    if (!object) {
                        return new Response(null, { status: 404 })
                    }
                    return new Response(object.body, {
                        headers: {
                            "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
                            "Cache-Control": "public, max-age=31536000, immutable",
                        },
                    })
                }
            ),
        },
    }
}
