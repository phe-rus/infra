/**
 * Rewrites an absolute, cross-origin image URL to go through this app's own
 * image proxy (see createImageProxy in ./image-proxy) instead of hitting the
 * remote origin directly. A repeat visitor is then served from this app's
 * own edge cache rather than re-fetching cross-origin every time.
 */
export function proxiedImageSrc(
    src: string,
    proxyPath = "/_image"
): string {
    return `${proxyPath}?url=${encodeURIComponent(src)}`
}
