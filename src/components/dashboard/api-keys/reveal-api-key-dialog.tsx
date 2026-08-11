import { DialogWidget } from "@/components/widgets/dialog-widget"
import { Button } from "@/components/ui/button"
import { IconCheck, IconCopy } from "@tabler/icons-react"
import { useState } from "react"

type RevealApiKeyDialogProps = {
    apiKey: string | null
    onClose: () => void
}

export function RevealApiKeyDialog({ apiKey, onClose }: RevealApiKeyDialogProps) {
    const [copied, setCopied] = useState(false)

    async function handleCopy() {
        if (!apiKey) return
        await navigator.clipboard.writeText(apiKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <DialogWidget
            open={Boolean(apiKey)}
            onOpenChange={(open) => !open && onClose()}
            title="Key created"
            description="Copy this key now — you won't be able to see it again."
            footer={
                <Button type="button" onClick={onClose}>
                    Done
                </Button>
            }
        >
            <code className="block rounded-none border border-input bg-input/30 p-3 text-xs break-all">
                {apiKey}
            </code>
            <Button type="button" variant="outline" onClick={() => void handleCopy()}>
                {copied ? (
                    <>
                        <IconCheck className="size-4" /> Copied
                    </>
                ) : (
                    <>
                        <IconCopy className="size-4" /> Copy
                    </>
                )}
            </Button>
        </DialogWidget>
    )
}
