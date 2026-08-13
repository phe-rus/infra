const ALGORITHM = { name: "ECDSA", namedCurve: "P-256" } as const

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
    const binary = atob(base64)
    const bytes = new Uint8Array(new ArrayBuffer(binary.length))
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

// the connecting app generates its own ECDSA P-256 keypair and only ever
// sends us the public key (JWK) — the private key never crosses the wire
export async function importApplicationPublicKey(publicKeyJwk: string): Promise<CryptoKey> {
    const jwk = JSON.parse(publicKeyJwk) as JsonWebKey
    return crypto.subtle.importKey("jwk", jwk, ALGORITHM, false, ["verify"])
}

export async function verifyApplicationSignature(
    publicKeyJwk: string,
    signatureBase64: string,
    payload: string
): Promise<boolean> {
    try {
        const key = await importApplicationPublicKey(publicKeyJwk)
        const signature = base64ToBytes(signatureBase64)
        return await crypto.subtle.verify(
            { name: "ECDSA", hash: "SHA-256" },
            key,
            signature,
            new TextEncoder().encode(payload)
        )
    } catch {
        return false
    }
}
