import { env } from "cloudflare:workers"
import { createAuthEndpoint, sessionMiddleware, APIError } from "better-auth/api"
import * as z from "zod"
import { isAdminTier } from "@/auth/permissions"
import { ALLOWED_TYPES, MAX_FILE_BYTES } from "../objects/constants"
import { sniffExtension, isImageExtension } from "../objects/sniff-file-type"
import { sanitizeSvg } from "../objects/sanitize-svg"
import { listAllObjects } from "../objects/r2-paths"
import { schema } from "./schema"
import { APP_TYPES } from "./constants"
import { slugify } from "./identifier"
import { generateRegistrationSecret, hashSecret } from "./secret"

type ApplicationRecord = {
    id: string
    name: string
    identifier: string
    type: string
    logoKey: string | null
    publicKey: string | null
    registrationSecretHash: string | null
    status: string
    active: boolean
    createdBy: string
    createdAt: Date
    updatedAt: Date
}

function logoPrefix(applicationId: string): string {
    return `applications/${applicationId}/`
}

function logoKey(applicationId: string, ext: string): string {
    return `${logoPrefix(applicationId)}logo.${ext}`
}

function requireAdmin(role: string | null | undefined) {
    if (!isAdminTier(role ?? "")) {
        throw new APIError("FORBIDDEN", { message: "Admin access required" })
    }
}

// raw adapter calls don't respect the schema's `returned: false` (that's
// only honored by better-auth's own output parsing for core models), so
// the hash has to be stripped by hand before anything leaves the endpoint
function redactApplication(application: ApplicationRecord): Omit<ApplicationRecord, "registrationSecretHash"> {
    const { registrationSecretHash: _registrationSecretHash, ...rest } = application
    return rest
}

export function applications() {
    return {
        id: "applications",
        schema,
        endpoints: {
            createApplication: createAuthEndpoint(
                "/applications/create",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    body: z.object({
                        name: z.string().min(1),
                        type: z.enum(APP_TYPES),
                        identifier: z
                            .string()
                            .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase letters, numbers, and hyphens only")
                            .optional(),
                    }),
                },
                async (ctx) => {
                    requireAdmin(ctx.context.session.user.role)
                    const adapter = ctx.context.adapter

                    let identifier: string
                    if (ctx.body.identifier) {
                        const taken = await adapter.findOne({
                            model: "application",
                            where: [{ field: "identifier", value: ctx.body.identifier }],
                        })
                        if (taken) throw new APIError("BAD_REQUEST", { message: "That identifier is already taken" })
                        identifier = ctx.body.identifier
                    } else {
                        const base = slugify(ctx.body.name)
                        identifier = base
                        let suffix = 1
                        while (
                            await adapter.findOne({
                                model: "application",
                                where: [{ field: "identifier", value: identifier }],
                            })
                        ) {
                            suffix += 1
                            identifier = `${base}-${suffix}`
                        }
                    }

                    const secret = generateRegistrationSecret()
                    const registrationSecretHash = await hashSecret(secret)

                    const application = await adapter.create<
                        Omit<ApplicationRecord, "id" | "createdAt" | "updatedAt">,
                        ApplicationRecord
                    >({
                        model: "application",
                        data: {
                            name: ctx.body.name,
                            identifier,
                            type: ctx.body.type,
                            logoKey: null,
                            publicKey: null,
                            registrationSecretHash,
                            status: "unverified",
                            active: true,
                            createdBy: ctx.context.session.user.id,
                        },
                    })

                    return ctx.json({ application: redactApplication(application), secret })
                }
            ),
            listApplications: createAuthEndpoint(
                "/applications/list",
                { method: "GET", use: [sessionMiddleware] },
                async (ctx) => {
                    requireAdmin(ctx.context.session.user.role)
                    const applications = await ctx.context.adapter.findMany<ApplicationRecord>({
                        model: "application",
                        select: [
                            "id",
                            "name",
                            "identifier",
                            "type",
                            "logoKey",
                            "publicKey",
                            "status",
                            "active",
                            "createdBy",
                            "createdAt",
                            "updatedAt",
                        ],
                        sortBy: { field: "createdAt", direction: "desc" },
                    })
                    return ctx.json({ applications })
                }
            ),
            setApplicationActive: createAuthEndpoint(
                "/applications/set-active",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    body: z.object({ applicationId: z.string().min(1), active: z.boolean() }),
                },
                async (ctx) => {
                    requireAdmin(ctx.context.session.user.role)
                    const application = await ctx.context.adapter.update<ApplicationRecord>({
                        model: "application",
                        where: [{ field: "id", value: ctx.body.applicationId }],
                        update: { active: ctx.body.active },
                    })
                    if (!application) throw new APIError("NOT_FOUND", { message: "Application not found" })
                    return ctx.json({ application: redactApplication(application) })
                }
            ),
            rotateApplication: createAuthEndpoint(
                "/applications/rotate",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    body: z.object({ applicationId: z.string().min(1) }),
                },
                async (ctx) => {
                    requireAdmin(ctx.context.session.user.role)
                    const secret = generateRegistrationSecret()
                    const registrationSecretHash = await hashSecret(secret)
                    const application = await ctx.context.adapter.update<ApplicationRecord>({
                        model: "application",
                        where: [{ field: "id", value: ctx.body.applicationId }],
                        update: { publicKey: null, registrationSecretHash, status: "unverified" },
                    })
                    if (!application) throw new APIError("NOT_FOUND", { message: "Application not found" })
                    return ctx.json({ application: redactApplication(application), secret })
                }
            ),
            removeApplication: createAuthEndpoint(
                "/applications/remove",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    body: z.object({ applicationId: z.string().min(1) }),
                },
                async (ctx) => {
                    requireAdmin(ctx.context.session.user.role)
                    await ctx.context.adapter.delete({
                        model: "application",
                        where: [{ field: "id", value: ctx.body.applicationId }],
                    })
                    return ctx.json({ success: true })
                }
            ),
            uploadApplicationLogo: createAuthEndpoint(
                "/applications/logo",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    metadata: { allowedMediaTypes: ["multipart/form-data"] },
                    body: z.object({ file: z.instanceof(File), applicationId: z.string().min(1) }),
                },
                async (ctx) => {
                    requireAdmin(ctx.context.session.user.role)
                    const file = ctx.body.file
                    if (file.size > MAX_FILE_BYTES) {
                        throw new APIError("BAD_REQUEST", { message: `File too large, max ${MAX_FILE_BYTES} bytes` })
                    }
                    const bytes = new Uint8Array(await file.arrayBuffer())
                    const ext = sniffExtension(bytes)
                    if (!ext || !isImageExtension(ext)) {
                        throw new APIError("BAD_REQUEST", { message: "Logo must be an image" })
                    }
                    const contentType = ALLOWED_TYPES[ext]
                    const body =
                        ext === "svg"
                            ? new TextEncoder().encode(sanitizeSvg(new TextDecoder().decode(bytes)))
                            : bytes

                    const bucket = env.STORAGE
                    const existing = await listAllObjects(bucket, logoPrefix(ctx.body.applicationId))
                    for (const obj of existing) {
                        await bucket.delete(obj.key)
                    }
                    const key = logoKey(ctx.body.applicationId, ext)
                    await bucket.put(key, body, { httpMetadata: { contentType } })

                    const application = await ctx.context.adapter.update<ApplicationRecord>({
                        model: "application",
                        where: [{ field: "id", value: ctx.body.applicationId }],
                        update: { logoKey: key },
                    })
                    if (!application) throw new APIError("NOT_FOUND", { message: "Application not found" })
                    return ctx.json({ application: redactApplication(application) })
                }
            ),
            registerApplicationKey: createAuthEndpoint(
                "/applications/register",
                {
                    method: "POST",
                    body: z.object({
                        identifier: z.string().min(1),
                        secret: z.string().min(1),
                        publicKey: z.string().min(1),
                    }),
                },
                async (ctx) => {
                    const secretHash = await hashSecret(ctx.body.secret)
                    // update's where clause is both selector and value-guard here:
                    // a concurrent racer presenting the same (already-consumed)
                    // secret simply matches zero rows and gets NOT_FOUND. The
                    // only party that could race a legitimate app here is itself,
                    // not an attacker without the secret, so this is an accepted
                    // simplification rather than a full consumeOne-style guard
                    const application = await ctx.context.adapter.update<ApplicationRecord>({
                        model: "application",
                        where: [
                            { field: "identifier", value: ctx.body.identifier },
                            { field: "registrationSecretHash", value: secretHash },
                        ],
                        update: {
                            publicKey: ctx.body.publicKey,
                            registrationSecretHash: null,
                            status: "verified",
                        },
                    })
                    if (!application) {
                        throw new APIError("UNAUTHORIZED", { message: "Invalid or already-used registration secret" })
                    }
                    return ctx.json({ status: "verified" })
                }
            ),
        },
    }
}
