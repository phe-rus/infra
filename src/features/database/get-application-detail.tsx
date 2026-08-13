import { type FC, useRef, useState } from "react"
import { DrawerClose } from "@/components/ui/drawer"
import { DialogWidget } from "@/components/widgets/dialog-widget"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRotateApplication, useSetApplicationActive, useUploadApplicationLogo } from "@/kit/hypermedia/applications"
import type { ListedApplication } from "@/kit/types"
import { format } from "date-fns/format"
import { IconCopy } from "@tabler/icons-react"

export type GetApplicationDetailProps = {
    applicationId: string | null
    applications: ListedApplication[]
    onClose: () => void
}

function logoUrl(logoKey: string): string {
    return `/api/auth/objects/download?key=${encodeURIComponent(logoKey)}`
}

export const GetApplicationDetail: FC<GetApplicationDetailProps> = ({ applicationId, applications, onClose }) => {
    const application = applications.find((a) => a.id === applicationId) ?? null
    const { mutateAsync: rotateApplication, isPending: isRotating } = useRotateApplication()
    const { mutateAsync: setApplicationActive } = useSetApplicationActive()
    const { mutateAsync: uploadApplicationLogo, isPending: isUploadingLogo } = useUploadApplicationLogo()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [rotatedSecret, setRotatedSecret] = useState<string | null>(null)

    function handleClose() {
        setRotatedSecret(null)
        onClose()
    }

    async function handleRotate() {
        if (!application) return
        const result = await rotateApplication({ data: { applicationId: application.id } })
        setRotatedSecret(result.secret)
    }

    async function handleLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        e.target.value = ""
        if (!file || !application) return
        const formData = new FormData()
        formData.set("file", file)
        formData.set("applicationId", application.id)
        await uploadApplicationLogo({ data: formData })
    }

    return (
        <DialogWidget
            open={Boolean(applicationId)}
            onOpenChange={(open) => !open && handleClose()}
            title={application?.name ?? "Application"}
            description={application?.identifier}
            footer={<DrawerClose render={<Button type="button" variant="outline" />}>Close</DrawerClose>}
        >
            {application && (
                <>
                    <section className="flex items-center gap-3">
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingLogo}>
                            <Avatar size="lg">
                                {application.logoKey && <AvatarImage src={logoUrl(application.logoKey)} alt="" />}
                                <AvatarFallback>{application.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => void handleLogoSelected(e)}
                        />
                        <span className="text-xs text-muted-foreground">
                            {isUploadingLogo ? "Uploading…" : "Click to change logo"}
                        </span>
                    </section>

                    <section className="flex flex-wrap gap-2">
                        <Badge variant="outline">{application.type}</Badge>
                        <Badge variant={application.status === "verified" ? "outline" : "secondary"}>
                            {application.status}
                        </Badge>
                        <Badge variant={application.active ? "outline" : "destructive"}>
                            {application.active ? "Active" : "Disabled"}
                        </Badge>
                    </section>

                    <section className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            Identifier: <code className="text-foreground">{application.identifier}</code>
                            <button
                                type="button"
                                onClick={() => void navigator.clipboard.writeText(application.identifier)}
                                aria-label="Copy identifier"
                            >
                                <IconCopy className="size-3" />
                            </button>
                        </div>
                        <div>
                            ID: <code className="text-foreground">{application.id}</code>
                        </div>
                        <div>Created by: <code className="text-foreground">{application.createdBy}</code></div>
                        <div>Created {format(application.createdAt, "PPPp")}</div>
                        <div>Updated {format(application.updatedAt, "PPPp")}</div>
                    </section>

                    <Separator />

                    <section className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">Connection</h3>
                        {application.publicKey ? (
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-muted-foreground">
                                    A public key is registered — signed requests from this app are verified against it.
                                </p>
                                <pre className="whitespace-pre-wrap break-all rounded bg-muted p-3 text-xs">
                                    {application.publicKey}
                                </pre>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Not yet connected — waiting for this application to register its public key using its
                                one-time secret.
                            </p>
                        )}
                    </section>

                    <Separator />

                    <section className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">Access</h3>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                void setApplicationActive({
                                    data: { applicationId: application.id, active: !application.active },
                                })
                            }
                        >
                            {application.active ? "Disable" : "Enable"}
                        </Button>
                        <Button type="button" variant="outline" isDisabled={isRotating} onClick={() => void handleRotate()}>
                            Rotate secret
                        </Button>
                        {rotatedSecret && (
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-muted-foreground">
                                    New secret — shown once, copy it now:
                                </p>
                                <pre className="whitespace-pre-wrap break-all rounded bg-muted p-3 text-xs">
                                    {rotatedSecret}
                                </pre>
                            </div>
                        )}
                    </section>
                </>
            )}
        </DialogWidget>
    )
}
