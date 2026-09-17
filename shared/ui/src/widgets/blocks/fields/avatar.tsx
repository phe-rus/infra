import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../components/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Delete02Icon,
    Image02Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "../../../components/button"
import { useFieldContext } from "../contexts"
import { useEffect, useRef, useState } from "react"
import { cn } from "../../../lib/utils"

// A field's value has three real states, not two: `null` (untouched, keep
// whatever's already there), a `File` (a new one was picked), and `false`
// (explicitly cleared, distinct from untouched — only reachable when
// `clearable` is on). The submitting form reads this to decide whether to
// upload a new file, send an explicit clear, or omit the field entirely.
export type FieldAvatarValue = File | null | false

type FieldAvatarProps = {
    existingImage?: string | null
    label: string
    accept?: string
    /** Show a remove button once there's something to remove (an existing
     * image, or a newly picked one). Off by default: a personal avatar
     * usually just gets replaced, not cleared to nothing. */
    clearable?: boolean
}

export function FieldAvatar({
    existingImage,
    label,
    accept = "image/png,image/webp,image/jpeg,image/svg+xml",
    clearable = false,
}: FieldAvatarProps) {
    const field = useFieldContext<FieldAvatarValue>()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(
        null
    )
    const isCleared = field.state.value === false

    useEffect(() => {
        if (!(field.state.value instanceof File)) {
            setPreview(null)
            return
        }
        const url = URL.createObjectURL(field.state.value)
        setPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [field.state.value])

    const currentImage = isCleared
        ? undefined
        : (preview ?? existingImage ?? undefined)
    const canClear =
        clearable && !isCleared && Boolean(currentImage)

    return (
        <div
            className={cn(
                "group relative flex w-fit flex-col items-center gap-4",
                "justify-center rounded-full"
            )}
        >
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full"
                aria-label="Change avatar"
            >
                <Avatar size="lg" className="size-43!">
                    <AvatarImage
                        src={currentImage}
                        alt={label}
                        className="transition-opacity group-hover:opacity-50"
                    />
                    <AvatarFallback>
                        {(
                            label.charAt(0) || "?"
                        ).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ""
                    if (file) field.handleChange(file)
                }}
            />
            <Button
                type="button"
                variant="secondary"
                size="icon"
                className={cn(
                    "absolute m-auto flex opacity-70 group-hover:opacity-100",
                    "rounded-full! shadow-md shadow-accent"
                )}
                onClick={() => fileInputRef.current?.click()}
            >
                <HugeiconsIcon icon={Image02Icon} />
            </Button>
            {canClear && (
                <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground"
                    onClick={() => field.handleChange(false)}
                >
                    <HugeiconsIcon icon={Delete02Icon} />
                    Remove
                </Button>
            )}
        </div>
    )
}
