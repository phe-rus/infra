import { proxiedImageSrc } from "./proxied-src"

export type ImageLoader = (src: string) => string

// The default URL-building strategy: routes src through this app's own
// image proxy. A caller-supplied `loader` prop bypasses this entirely — it
// returns a final URL directly, proxy included or not.
export function buildSrc(src: string, loader: ImageLoader | undefined, proxyPath?: string): string {
    if (loader) return loader(src)
    return proxiedImageSrc(src, proxyPath)
}
