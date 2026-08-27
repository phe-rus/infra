import {
    IconFileFilled,
    IconFolderFilled,
    IconMinus,
} from "@tabler/icons-react"
import { useListObjects, useDeleteObjects } from "@/domains/storage"
import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { TanstackImage } from "@infra/tanstack-image"
import type { FC } from "react"

export type BrowseObjectsProps = {
    prefix: string
    onNavigate: (prefix: string) => void
}

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const cdnUrl = (key: string): string => `/api/cdn/${key}`

export const BrowseObjects: FC<BrowseObjectsProps> = ({
    prefix,
    onNavigate,
}) => {
    const { data, isLoading } = useListObjects(prefix)
    const { mutate: deleteObjects } = useDeleteObjects()

    if (isLoading)
        return <p className="text-xs text-muted-foreground">Loading…</p>
    if (!data) return null
    if (data.folders.length === 0 && data.files.length === 0) {
        return <p className="text-xs text-muted-foreground">Empty.</p>
    }

    return (
        <section className="flex flex-col gap-4">
            {data.folders.length > 0 && (
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                    {data.folders.map((folder) => (
                        <article
                            key={folder.key}
                            onClick={() => onNavigate(folder.key)}
                            className={cn(
                                "flex min-w-0 items-center gap-2 overflow-hidden",
                                "col-span-1 bg-card px-2 py-2 border! border-border/35!",
                                "cursor-pointer hover:bg-accent"
                            )}
                        >
                            <IconFolderFilled className="size-7! shrink-0" />
                            <span className="min-w-0 flex-1 truncate text-xs">
                                {folder.name}
                            </span>
                            <Button
                                size="icon-xs"
                                variant="destructive"
                                className="mr-auto size-5!"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    deleteObjects({
                                        data: { prefix: folder.key },
                                    })
                                }}
                            >
                                <IconMinus />
                            </Button>
                        </article>
                    ))}
                </div>
            )}

            {data.files.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {data.files.map((file) => (
                        <a
                            key={file.key}
                            href={cdnUrl(file.key)}
                            target="_blank"
                            rel="noreferrer"
                            className={cn("relative flex flex-col")}
                        >
                            <div
                                className={cn(
                                    "relative flex aspect-video border",
                                    "ease-out hover:scale-[0.99]",
                                    "transition-transform duration-50",
                                    "border-dashed"
                                )}
                            >
                                {file.contentType?.startsWith("image/") ? (
                                    <TanstackImage
                                        src={cdnUrl(file.key)}
                                        alt={file.name}
                                        unoptimized
                                        className={cn(
                                            "aspect-video rounded-none! object-cover",
                                            "flex shrink-0"
                                        )}
                                    />
                                ) : (
                                    <IconFileFilled className="m-auto size-8" />
                                )}
                            </div>
                            <div className="mb-auto flex flex-col p-1">
                                <span className="text-xs break-all">
                                    {file.name}
                                </span>
                                <span className="text-[8px] font-light text-muted-foreground">
                                    {formatBytes(file.size)}
                                </span>
                            </div>
                            <Button
                                size="icon-xs"
                                variant="destructive"
                                className="absolute top-1 right-1 size-5!"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    deleteObjects({
                                        data: { keys: [file.key] },
                                    })
                                }}
                            >
                                <IconMinus />
                            </Button>
                        </a>
                    ))}
                </div>
            )}
        </section>
    )
}
