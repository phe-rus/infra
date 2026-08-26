import { forwardRef, useState } from "react"
import type { ComponentPropsWithoutRef, CSSProperties } from "react"
import { buildSrc, type ImageLoader } from "./loader"

export type TanstackImageProps = Omit<
    ComponentPropsWithoutRef<"img">,
    "src" | "alt"
> & {
    src: string
    alt: string
    proxyPath?: string
    // bypasses the proxy entirely, rendering src as-is
    unoptimized?: boolean
    // the value shown in the plain src attribute, decoupled from whatever
    // url the proxy/loader builds — for SEO/crawler cases that need a
    // stable src independent of that rewrite
    overrideSrc?: string
    // fully overrides URL construction for this instance; the proxy is
    // this package's default strategy, not a hardcoded one
    loader?: ImageLoader
    placeholder?: "empty" | "blur"
    blurDataURL?: string
}

// A drop-in <img> replacement, not a walled-off component: every native img
// prop (className, style, onLoad, loading, ...) passes straight through,
// and the ref points at the real <img> node, same as plain <img> would.
export const TanstackImage = forwardRef<
    HTMLImageElement,
    TanstackImageProps
>(
    (
        {
            src,
            alt,
            proxyPath,
            unoptimized,
            overrideSrc,
            loader,
            placeholder = "empty",
            blurDataURL,
            width,
            height,
            style,
            onLoad,
            ...rest
        },
        ref
    ) => {
        const [loaded, setLoaded] = useState(false)
        const resolvedSrc = unoptimized
            ? src
            : buildSrc(src, loader, proxyPath)

        const placeholderStyle: CSSProperties =
            !unoptimized &&
            placeholder === "blur" &&
            blurDataURL &&
            !loaded
                ? {
                      backgroundImage: `url(${blurDataURL})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "blur(20px)",
                  }
                : {}

        return (
            <img
                ref={ref}
                src={overrideSrc ?? resolvedSrc}
                alt={alt}
                width={width}
                height={height}
                style={{ ...placeholderStyle, ...style }}
                onLoad={(event) => {
                    setLoaded(true)
                    onLoad?.(event)
                }}
                {...rest}
            />
        )
    }
)
TanstackImage.displayName = "TanstackImage"
