import { Avatar, AvatarFallback, AvatarImage } from "../../../components/avatar"
import { IconImageInPicture } from "@tabler/icons-react"
import { Button } from "../../../components/button"
import { useFieldContext } from "../contexts"
import { useEffect, useRef, useState } from "react"
import { cn } from "../../../lib/utils"

type FieldAvatarProps = {
    existingImage?: string | null
    label: string
    accept?: string
}

export function FieldAvatar({
    existingImage,
    label,
    accept = "image/png,image/webp,image/jpeg,image/svg+xml",
}: FieldAvatarProps) {
    const field = useFieldContext<File | null>()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(null)

    useEffect(() => {
        if (!field.state.value) {
            setPreview(null)
            return
        }
        const url = URL.createObjectURL(field.state.value)
        setPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [field.state.value])

    return (
        <div className={cn(
            "relative group flex flex-col items-center gap-4 w-fit",
            'rounded-full justify-center'
        )}>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full"
                aria-label="Change avatar"
            >
                <Avatar size="lg" className='size-43!'>
                    <AvatarImage
                        src={preview ?? existingImage ?? undefined}
                        alt={label}
                        className='group-hover:opacity-50 transition-opacity'
                    />
                    <AvatarFallback>
                        {label.charAt(0)?.toUpperCase() ?? "?"}
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
                    if (file) field.handleChange(file)
                }}
            />
            <Button
                type="button"
                variant='secondary'
                size='icon'
                className={cn(
                    'absolute m-auto flex opacity-70 group-hover:opacity-100',
                    'rounded-full! shadow-md shadow-accent'
                )}
                onClick={() => fileInputRef.current?.click()}
            >
                <IconImageInPicture />
            </Button>
        </div>
    )
}
