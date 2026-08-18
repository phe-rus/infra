import type { PublicKey } from "./client"

// RFC-9421 (HTTP Message Signatures) verification for PawaPay callbacks —
// confirmed against their actual docs (docs.pawapay.io/v2/docs/signatures),
// not assumed: ecdsa-p256-sha256, covered components come from the incoming
// Signature-Input header itself (not hardcoded), Content-Digest is checked
// first, PawaPay's public key is fetched by keyid from their public-key
// endpoint. ECDSA signatures under RFC 9421 are IEEE P1363 (raw r||s), which
// is exactly what Web Crypto's `ECDSA` verify expects natively — no DER
// conversion needed.

// explicit ArrayBuffer generic — a fresh `new Uint8Array(length)` is always
// backed by a real ArrayBuffer at runtime, never SharedArrayBuffer, but
// newer TS lib typings leave that generic unresolved (ArrayBufferLike),
// which then fails the stricter BufferSource checks Web Crypto's calls want
function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

function bytesToBase64(bytes: ArrayBuffer): string {
    let binary = ""
    for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte)
    return btoa(binary)
}

// "sig1=:BASE64:" -> raw bytes
function parseStructuredByteSequence(headerValue: string): Uint8Array<ArrayBuffer> {
    const match = headerValue.match(/:([A-Za-z0-9+/=]+):/)
    if (!match) throw new Error("Malformed signature header")
    return base64ToBytes(match[1])
}

function pemToDer(pem: string): Uint8Array<ArrayBuffer> {
    const base64 = pem
        .replace(/-----BEGIN PUBLIC KEY-----/, "")
        .replace(/-----END PUBLIC KEY-----/, "")
        .replace(/\s+/g, "")
    return base64ToBytes(base64)
}

async function importEcPublicKey(pem: string): Promise<CryptoKey> {
    const der = pemToDer(pem)
    return crypto.subtle.importKey("spki", der, { name: "ECDSA", namedCurve: "P-256" }, false, [
        "verify",
    ])
}

type SignatureInputInfo = {
    label: string
    coveredComponents: string[]
    params: Record<string, string>
    // the exact string after "label=", used verbatim as the @signature-params
    // line's value — safer than re-serializing the list/params ourselves
    rawParamsValue: string
}

function parseSignatureInput(headerValue: string): SignatureInputInfo {
    // e.g. sig1=("@method" "@authority" "@path" "signature-date" ...);alg="ecdsa-p256-sha256";keyid="...";created=...;expires=...
    const eq = headerValue.indexOf("=")
    if (eq === -1) throw new Error("Malformed Signature-Input header")
    const label = headerValue.slice(0, eq).trim()
    const rawParamsValue = headerValue.slice(eq + 1).trim()

    const listMatch = rawParamsValue.match(/^\(([^)]*)\)/)
    if (!listMatch) throw new Error("Malformed Signature-Input component list")
    const coveredComponents = [...listMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])

    const params: Record<string, string> = {}
    for (const m of rawParamsValue
        .slice(listMatch[0].length)
        .matchAll(/;(\w+)=("([^"]*)"|[^;]+)/g)) {
        // m[3] (the quoted-inner-value group) is genuinely optional — only
        // set when the quoted alternative matched — but TS's default
        // RegExpMatchArray typing doesn't model that, so it looks always-defined
        params[m[1]] = m[3] ?? m[2]
    }

    return { label, coveredComponents, params, rawParamsValue }
}

async function verifyContentDigest(digestHeader: string, rawBody: string): Promise<boolean> {
    const match = digestHeader.match(/^(sha-256|sha-512)=:([A-Za-z0-9+/=]+):/)
    if (!match) return false
    const [, algo, expectedBase64] = match
    const digest = await crypto.subtle.digest(
        algo === "sha-512" ? "SHA-512" : "SHA-256",
        new TextEncoder().encode(rawBody)
    )
    return bytesToBase64(digest) === expectedBase64
}

function buildSignatureBase(
    coveredComponents: string[],
    rawParamsValue: string,
    request: Request,
    headers: Record<string, string>
): string {
    const url = new URL(request.url)
    const lines: string[] = []
    for (const component of coveredComponents) {
        let value: string
        switch (component) {
            case "@method":
                value = request.method.toUpperCase()
                break
            case "@authority":
                value = url.host
                break
            case "@path":
                value = url.pathname
                break
            default: {
                const headerValue = headers[component]
                // Record<string, string> indexing doesn't prove `component` is
                // an actual key — this genuinely catches a covered signature
                // component missing from the real request headers
                if (headerValue === undefined)
                    throw new Error(`Missing covered header: ${component}`)
                value = headerValue.trim()
            }
        }
        lines.push(`"${component}": ${value}`)
    }
    lines.push(`"@signature-params": ${rawParamsValue}`)
    return lines.join("\n")
}

export async function verifyPawaPayCallback(
    request: Request,
    rawBody: string,
    fetchPublicKeys: () => Promise<PublicKey[]>
): Promise<boolean> {
    const signature = request.headers.get("signature")
    const signatureInputHeader = request.headers.get("signature-input")
    const contentDigest = request.headers.get("content-digest")
    const signatureDate = request.headers.get("signature-date")
    const contentType = request.headers.get("content-type")

    if (!signature || !signatureInputHeader || !contentDigest || !signatureDate) {
        return false
    }

    if (!(await verifyContentDigest(contentDigest, rawBody))) {
        return false
    }

    const { coveredComponents, rawParamsValue, params } = parseSignatureInput(signatureInputHeader)
    if (params.alg !== "ecdsa-p256-sha256") {
        return false
    }

    const publicKeys = await fetchPublicKeys()
    const matchingKey = publicKeys.find((k) => k.id === params.keyid)
    if (!matchingKey) {
        return false
    }

    const base = buildSignatureBase(coveredComponents, rawParamsValue, request, {
        "signature-date": signatureDate,
        "content-digest": contentDigest,
        ...(contentType && { "content-type": contentType }),
    })

    const signatureBytes = parseStructuredByteSequence(signature)
    const publicKey = await importEcPublicKey(matchingKey.key)

    return crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        publicKey,
        signatureBytes,
        new TextEncoder().encode(base)
    )
}
