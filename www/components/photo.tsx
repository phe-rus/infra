import { cn } from "@infra/ui/lib/utils"
import { forwardRef, type ImgHTMLAttributes } from "react"

export interface PhotoProps
    extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
    /** Deterministic key into the placeholder photo pool, e.g. "pherus-lab". */
    seed: string
    width?: number
    height?: number
    /** Thin inset border tying every photo to the same visual language. */
    frame?: boolean
}

/**
 * The one photographic surface used across the site. A light, shared
 * contrast/saturation punch (not desaturation) is what ties disparate
 * placeholder photos into one visual language while keeping them vivid
 * and alive, rather than flattened and archival-looking.
 */
export const Photo = forwardRef<HTMLImageElement, PhotoProps>(
    function Photo(
        {
            seed,
            width = 960,
            height = 1200,
            frame = true,
            className,
            alt,
            ...props
        },
        ref
    ) {
        return (
            <span className="relative block h-full w-full overflow-hidden">
                <img
                    ref={ref}
                    src={`https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`}
                    alt={alt ?? ""}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                        "h-full w-full object-cover contrast-105 saturate-110",
                        className
                    )}
                    {...props}
                />
                {frame && (
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                    />
                )}
            </span>
        )
    }
)
