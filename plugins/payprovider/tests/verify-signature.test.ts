import { describe, expect, it } from "vitest"
import { verifyPawaPayCallback } from "../src/pawapay/verify-signature"
import type { PublicKey } from "../src/pawapay/pawapay-client"

// Builds a real RFC-9421-signed request the same way PawaPay's own servers
// would, so these tests exercise verifyPawaPayCallback end to end against
// genuine Web Crypto signatures rather than mocking any part of the
// verification path. This is the one part of the payments plugin infra/CLAUDE.md
// flags as previously only manually tested ("synthetic self-signed test
// cases covering tampered-body/wrong-key scenarios"); this file makes that
// automatic.

const KEY_ID = "test-key-1"
const COVERED = ["@method", "@authority", "@path", "content-digest", "signature-date"]

function bytesToBase64(bytes: ArrayBuffer): string {
    let binary = ""
    for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte)
    return btoa(binary)
}

function derToPem(der: ArrayBuffer): string {
    const base64 = bytesToBase64(der)
    const lines = base64.match(/.{1,64}/g) ?? [base64]
    return `-----BEGIN PUBLIC KEY-----\n${lines.join("\n")}\n-----END PUBLIC KEY-----`
}

async function generateKeyPair() {
    const keyPair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
        "sign",
        "verify",
    ])) as CryptoKeyPair
    const spki = await crypto.subtle.exportKey("spki", keyPair.publicKey)
    return { privateKey: keyPair.privateKey, publicKeyPem: derToPem(spki) }
}

async function sha256Base64(text: string): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
    return bytesToBase64(digest)
}

type SignedRequest = { request: Request; publicKeys: PublicKey[] }

async function buildSignedRequest(options: {
    method?: string
    url?: string
    rawBody?: string
    privateKey: CryptoKey
    publicKeyPem: string
    keyId?: string
    alg?: string
    coveredComponents?: string[]
    tamperSignatureByte?: boolean
}): Promise<SignedRequest> {
    const {
        method = "POST",
        url = "https://example.com/pay/webhook",
        rawBody = '{"depositId":"abc-123","status":"COMPLETED"}',
        privateKey,
        publicKeyPem,
        keyId = KEY_ID,
        alg = "ecdsa-p256-sha256",
        coveredComponents = COVERED,
        tamperSignatureByte = false,
    } = options

    const contentDigest = `sha-256=:${await sha256Base64(rawBody)}:`
    const signatureDate = String(Math.floor(Date.now() / 1000))
    const created = signatureDate
    const rawParamsValue = `(${coveredComponents.map((c) => `"${c}"`).join(" ")});alg="${alg}";keyid="${keyId}";created=${created}`

    const parsedUrl = new URL(url)
    const headerValues: Record<string, string> = {
        "content-digest": contentDigest,
        "signature-date": signatureDate,
    }

    const lines = coveredComponents.map((component) => {
        switch (component) {
            case "@method":
                return `"${component}": ${method.toUpperCase()}`
            case "@authority":
                return `"${component}": ${parsedUrl.host}`
            case "@path":
                return `"${component}": ${parsedUrl.pathname}`
            default:
                return `"${component}": ${headerValues[component]}`
        }
    })
    lines.push(`"@signature-params": ${rawParamsValue}`)
    const signatureBase = lines.join("\n")

    let signatureBytes = await crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" },
        privateKey,
        new TextEncoder().encode(signatureBase)
    )
    if (tamperSignatureByte) {
        const mutable = new Uint8Array(signatureBytes)
        mutable[0] ^= 0xff
        signatureBytes = mutable.buffer
    }

    const request = new Request(url, {
        method,
        body: method === "GET" ? undefined : rawBody,
        headers: {
            signature: `sig1=:${bytesToBase64(signatureBytes)}:`,
            "signature-input": `sig1=${rawParamsValue}`,
            "content-digest": contentDigest,
            "signature-date": signatureDate,
        },
    })

    return { request, publicKeys: [{ id: keyId, key: publicKeyPem }] }
}

describe("verifyPawaPayCallback", () => {
    it("accepts a genuinely valid RFC-9421-signed request", async () => {
        const { privateKey, publicKeyPem } = await generateKeyPair()
        const rawBody = '{"depositId":"abc-123","status":"COMPLETED"}'
        const { request, publicKeys } = await buildSignedRequest({
            privateKey,
            publicKeyPem,
            rawBody,
        })

        await expect(verifyPawaPayCallback(request, rawBody, async () => publicKeys)).resolves.toBe(
            true
        )
    })

    it("rejects a body that doesn't match the signed content digest", async () => {
        const { privateKey, publicKeyPem } = await generateKeyPair()
        const rawBody = '{"depositId":"abc-123","status":"COMPLETED"}'
        const { request, publicKeys } = await buildSignedRequest({
            privateKey,
            publicKeyPem,
            rawBody,
        })

        const tamperedBody = '{"depositId":"abc-123","status":"REJECTED"}'
        await expect(
            verifyPawaPayCallback(request, tamperedBody, async () => publicKeys)
        ).resolves.toBe(false)
    })

    it("rejects a signature that's been tampered with", async () => {
        const { privateKey, publicKeyPem } = await generateKeyPair()
        const rawBody = '{"depositId":"abc-123","status":"COMPLETED"}'
        const { request, publicKeys } = await buildSignedRequest({
            privateKey,
            publicKeyPem,
            rawBody,
            tamperSignatureByte: true,
        })

        await expect(verifyPawaPayCallback(request, rawBody, async () => publicKeys)).resolves.toBe(
            false
        )
    })

    it("rejects a signature made with a key that isn't in the trusted public-key set", async () => {
        const signer = await generateKeyPair()
        const attacker = await generateKeyPair()
        const rawBody = '{"depositId":"abc-123","status":"COMPLETED"}'
        const { request } = await buildSignedRequest({
            privateKey: signer.privateKey,
            publicKeyPem: signer.publicKeyPem,
            rawBody,
        })

        // fetchPublicKeys returns a real, differently-keyed entry under the
        // same keyid, so the id lookup succeeds but the actual verify must
        // still fail against the wrong key material
        await expect(
            verifyPawaPayCallback(request, rawBody, async () => [
                { id: KEY_ID, key: attacker.publicKeyPem },
            ])
        ).resolves.toBe(false)
    })

    it("rejects when no public key matches the signature's keyid", async () => {
        const { privateKey, publicKeyPem } = await generateKeyPair()
        const rawBody = '{"depositId":"abc-123","status":"COMPLETED"}'
        const { request } = await buildSignedRequest({
            privateKey,
            publicKeyPem,
            rawBody,
            keyId: "signed-with-this-key",
        })

        await expect(
            verifyPawaPayCallback(request, rawBody, async () => [
                { id: "a-different-key-id", key: publicKeyPem },
            ])
        ).resolves.toBe(false)
    })

    it("rejects an unsupported signature algorithm", async () => {
        const { privateKey, publicKeyPem } = await generateKeyPair()
        const rawBody = '{"depositId":"abc-123","status":"COMPLETED"}'
        const { request, publicKeys } = await buildSignedRequest({
            privateKey,
            publicKeyPem,
            rawBody,
            alg: "rsa-pss-sha256",
        })

        await expect(verifyPawaPayCallback(request, rawBody, async () => publicKeys)).resolves.toBe(
            false
        )
    })

    it("rejects a request missing the signature header entirely", async () => {
        const { publicKeyPem } = await generateKeyPair()
        const rawBody = "{}"
        const bareRequest = new Request("https://example.com/pay/webhook", {
            method: "POST",
            body: rawBody,
        })

        await expect(
            verifyPawaPayCallback(bareRequest, rawBody, async () => [
                { id: KEY_ID, key: publicKeyPem },
            ])
        ).resolves.toBe(false)
    })

    it("rejects a request missing the content-digest header", async () => {
        const { privateKey, publicKeyPem } = await generateKeyPair()
        const rawBody = '{"depositId":"abc-123","status":"COMPLETED"}'
        const { request, publicKeys } = await buildSignedRequest({
            privateKey,
            publicKeyPem,
            rawBody,
        })

        const withoutDigest = new Request(request.url, {
            method: request.method,
            body: rawBody,
            headers: {
                signature: request.headers.get("signature") ?? "",
                "signature-input": request.headers.get("signature-input") ?? "",
                "signature-date": request.headers.get("signature-date") ?? "",
            },
        })

        await expect(
            verifyPawaPayCallback(withoutDigest, rawBody, async () => publicKeys)
        ).resolves.toBe(false)
    })

    it("verifies against the actual method, host, and path, not just the body", async () => {
        const { privateKey, publicKeyPem } = await generateKeyPair()
        const rawBody = '{"depositId":"abc-123","status":"COMPLETED"}'
        const { request, publicKeys } = await buildSignedRequest({
            privateKey,
            publicKeyPem,
            rawBody,
            url: "https://example.com/pay/webhook",
        })

        // same signature, wrong path, request forged to hit a different route
        const forgedRequest = new Request("https://example.com/pay/other-route", {
            method: request.method,
            body: rawBody,
            headers: request.headers,
        })

        await expect(
            verifyPawaPayCallback(forgedRequest, rawBody, async () => publicKeys)
        ).resolves.toBe(false)
    })
})
