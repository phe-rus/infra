import * as z from "zod"
import {
    MAX_FILE_BYTES,
    MAX_USER_QUOTA_BYTES,
    ALLOWED_TYPES,
    sniffExtension,
    isImageExtension,
    sanitizeSvg,
    avatarKey,
    avatarPrefix,
    fileKey,
    getUserUsageBytes,
    listAllObjects,
    stripExtension,
    cdnPath,
} from "@infra/r2/server"
import defineHandler from "../utils/defineHandler"
import { protectedSession } from "../middleware/permissions"
import { isAdminTier } from "../auth/core/permissions"
import { env } from "../utils/envs"

function readUploadedFile(body: unknown): File {
    const file = (body as Record<string, unknown> | undefined)?.file
    if (!(file instanceof File)) {
        throw new Error("No file provided")
    }
    if (file.size > MAX_FILE_BYTES) {
        throw new Error(`File too large, max ${MAX_FILE_BYTES} bytes`)
    }
    return file
}

async function sniffAndValidate(file: File) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const ext = sniffExtension(bytes)
    if (!ext) {
        throw new Error("Unrecognized or disallowed file type")
    }
    const contentType = ALLOWED_TYPES[ext]
    if (ext === "svg") {
        const sanitized = await sanitizeSvg(new TextDecoder().decode(bytes))
        return { ext, contentType, bytes: new TextEncoder().encode(sanitized) }
    }
    return { ext, contentType, bytes }
}

export const assetsRoute = defineHandler()
    .post("/avatar", protectedSession, async (c) => {
        const user = c.get("user")!
        const body = (await c.req.parseBody()) as Record<string, unknown>
        const file = readUploadedFile(body)
        const { ext, contentType, bytes } = await sniffAndValidate(file)
        if (!isImageExtension(ext)) {
            throw new Error("Avatar must be an image")
        }

        const [usage, existingAvatarObjects] = await Promise.all([
            getUserUsageBytes(env.R2, user.id),
            listAllObjects(env.R2, avatarPrefix(user.id)),
        ])
        const existingAvatarSize = existingAvatarObjects.reduce(
            (sum, obj) => sum + obj.size,
            0
        )
        const projectedUsage = usage - existingAvatarSize + bytes.byteLength
        if (projectedUsage > MAX_USER_QUOTA_BYTES) {
            throw new Error("Storage quota exceeded")
        }

        for (const obj of existingAvatarObjects) {
            await env.R2.delete(obj.key)
        }
        const key = avatarKey(user.id, ext)
        await env.R2.put(key, bytes, { httpMetadata: { contentType } })

        const path = cdnPath(key, Date.now())
        await env.AUTH_DB.prepare("UPDATE user SET image = ? WHERE id = ?")
            .bind(path, user.id)
            .run()

        return c.json({ url: path })
    })
    .post("/upload", protectedSession, async (c) => {
        const user = c.get("user")!
        const isAdmin = isAdminTier(user.role ?? "")
        const body = (await c.req.parseBody()) as Record<string, unknown>
        const file = readUploadedFile(body)
        const { ext, bytes, contentType } = await sniffAndValidate(file)

        const requestedPath = body.path
        const usesAdminPath =
            isAdmin &&
            typeof requestedPath === "string" &&
            requestedPath.length > 0

        if (!usesAdminPath) {
            const usage = await getUserUsageBytes(env.R2, user.id)
            if (usage + bytes.byteLength > MAX_USER_QUOTA_BYTES) {
                throw new Error("Storage quota exceeded")
            }
        }

        const filename = `${stripExtension(file.name || "file")}.${ext}`
        const key = usesAdminPath
            ? requestedPath
            : fileKey(user.id, filename)
        await env.R2.put(key, bytes, { httpMetadata: { contentType } })

        return c.json({ key, filename, size: bytes.byteLength })
    })
    .get("/list", protectedSession, async (c) => {
        const user = c.get("user")!
        const isAdmin = isAdminTier(user.role ?? "")
        const prefix = isAdmin ? (c.req.query("prefix") ?? "") : `${user.id}/`
        const result = await env.R2.list({
            prefix,
            delimiter: "/",
            include: ["httpMetadata"],
        })

        return c.json({
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
    })
    .post(
        "/delete",
        protectedSession,
        async (c) => {
            const user = c.get("user")!
            const bodySchema = z.object({
                keys: z.array(z.string().min(1)).optional(),
                prefix: z.string().min(1).optional(),
            })
            const body = bodySchema.parse(await c.req.json())
            if (!body.keys?.length && !body.prefix) {
                return c.text("Provide keys or prefix", 400)
            }
            const callerIsAdmin = isAdminTier(user.role ?? "")
            const ownPrefix = `${user.id}/`

            if (
                !callerIsAdmin &&
                body.prefix &&
                !body.prefix.startsWith(ownPrefix)
            ) {
                return c.text("Admin access required", 403)
            }

            const targetKeys = body.prefix
                ? (await listAllObjects(env.R2, body.prefix)).map(
                    (obj) => obj.key
                )
                : (body.keys ?? [])

            if (
                !callerIsAdmin &&
                targetKeys.some((key) => !key.startsWith(ownPrefix))
            ) {
                return c.text("Admin access required", 403)
            }

            for (let i = 0; i < targetKeys.length; i += 1000) {
                await env.R2.delete(targetKeys.slice(i, i + 1000))
            }
            return c.json({ success: true, deleted: targetKeys.length })
        }
    )
