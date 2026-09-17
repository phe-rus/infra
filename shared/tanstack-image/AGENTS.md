# shared/tanstack-image

## Overview

`@infra/tanstack-image` is a React image component (`TanstackImage`) paired with a Worker side proxy, giving `infra` and `www` a self hosted, edge cached alternative to Cloudflare Images or Next.js's built in optimizer. The client component talks to the server proxy for cross origin image optimization; nothing here is a paid transform binding.

## Key files

| File | Owns |
|---|---|
| `src/index.ts` | The `.` export: `TanstackImage`, the client component |
| `src/client/tanstack-image.tsx` | The component itself: loader, blur placeholder, passthrough of native `img` props |
| `src/client/loader.ts`, `src/client/proxied-src.ts` | How a source URL gets rewritten to go through the proxy |
| `src/server.ts` | The `./server` export: `ImageProxyOptions` and the proxy handler |
| `src/server/image-proxy.ts` | The actual proxy: remote pattern allowlisting, CSP, response size limits |
| `src/server/edge-cache.ts` | Edge cache read/write around the proxied fetch |

## Commands

Only `typecheck` (`tsc --noEmit`); no build or dev script, consumed directly as workspace source by whichever app imports it.

## Conventions

- Mount the server side explicitly: an app wires `ImageProxyOptions` (mount path, `allowedOrigins`/`remotePatterns`, cache TTL, CSP headers, `dangerouslyAllowSVG`) into its own Worker fetch handler; nothing is auto configured.
- `remotePatterns` matching is **prefix only, not glob**. A pattern that looks like a glob will not behave like one; get the exact prefix right or a legitimate image source gets silently blocked.

## Gotchas

- A misconfigured `remotePatterns`/`allowedOrigins` entry fails closed (the image just won't load), not with an obvious error at setup time; double check the pattern against a real source URL when wiring a new image source.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
