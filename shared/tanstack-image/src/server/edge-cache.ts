export type EdgeCacheContext = {
    waitUntil: (promise: Promise<unknown>) => void
}

// A Worker's own response is never auto-cached at Cloudflare's edge the way
// a plain proxied static asset is — that only happens if the Worker itself
// reads/writes caches.default, independent of whatever Cache-Control header
// the response carries. compute() only runs on a miss; a hit returns
// straight from the edge without compute ever running.
export async function withEdgeCache(
    request: Request,
    ctx: EdgeCacheContext,
    compute: () => Promise<Response>
): Promise<Response> {
    // @ts-expect-error - lib DOM's CacheStorage type shadows the Workers one that declares `default`
    const cache = caches.default as Cache
    const cached = await cache.match(request)
    if (cached) return cached

    const response = await compute()
    if (response.status === 200) {
        ctx.waitUntil(cache.put(request, response.clone()))
    }
    return response
}
