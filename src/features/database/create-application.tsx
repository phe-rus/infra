import { type FC, useState } from "react"
import { DrawerClose } from "@/components/ui/drawer"
import { DialogWidget } from "@/components/widgets/dialog-widget"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { APP_TYPES, type AppType } from "@/auth/plugins/applications/constants"
import { useCreateApplication } from "@/kit/hypermedia/applications"

export type CreateApplicationProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

function infraConfigSnippet(identifier: string, secret: string): string {
    return `const infraConfig = {
  appId: "${identifier}",
  authUrl: "${window.location.origin}/api/auth",
  registrationSecret: "${secret}", // one-time use, register your public key with it
}`
}

export const CreateApplication: FC<CreateApplicationProps> = ({ open, onOpenChange }) => {
    const { mutateAsync: createApplication, isPending } = useCreateApplication()
    const [draftName, setDraftName] = useState("")
    const [draftType, setDraftType] = useState<AppType>("web")
    const [draftIdentifier, setDraftIdentifier] = useState("")
    const [identifierTouched, setIdentifierTouched] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [created, setCreated] = useState<{ identifier: string; secret: string } | null>(null)

    function handleNameChange(value: string) {
        setDraftName(value)
        if (!identifierTouched) setDraftIdentifier(slugify(value))
    }

    function handleIdentifierChange(value: string) {
        setIdentifierTouched(true)
        setDraftIdentifier(slugify(value))
    }

    async function handleCreate() {
        setError(null)
        try {
            const result = await createApplication({
                data: {
                    name: draftName.trim(),
                    type: draftType,
                    identifier: draftIdentifier.trim() || undefined,
                },
            })
            setCreated({ identifier: result.application.identifier, secret: result.secret })
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not create application")
        }
    }

    function handleClose(nextOpen: boolean) {
        if (!nextOpen) {
            setDraftName("")
            setDraftType("web")
            setDraftIdentifier("")
            setIdentifierTouched(false)
            setError(null)
            setCreated(null)
        }
        onOpenChange(nextOpen)
    }

    if (created) {
        const snippet = infraConfigSnippet(created.identifier, created.secret)
        return (
            <DialogWidget
                open={open}
                onOpenChange={handleClose}
                title="Application created"
                description="This secret is shown once — copy it now, it can't be retrieved again."
                footer={
                    <DrawerClose render={<Button type="button" />} onClick={() => handleClose(false)}>
                        Done
                    </DrawerClose>
                }
            >
                <pre className="whitespace-pre-wrap break-all rounded bg-muted p-3 text-xs">{snippet}</pre>
                <Button type="button" variant="outline" onClick={() => void navigator.clipboard.writeText(snippet)}>
                    Copy infraConfig
                </Button>
            </DialogWidget>
        )
    }

    return (
        <DialogWidget
            open={open}
            onOpenChange={handleClose}
            title="Add an application"
            description="Register a new application. You'll get a one-time secret to bootstrap its connection."
            footer={
                <>
                    <Button
                        type="button"
                        isDisabled={!draftName.trim() || !draftIdentifier.trim() || isPending}
                        onClick={() => void handleCreate()}
                    >
                        Add application
                    </Button>
                    <DrawerClose render={<Button type="button" variant="outline" />}>Cancel</DrawerClose>
                </>
            }
        >
            <FieldGroup className="grid grid-cols-1 gap-3">
                <Field>
                    <FieldLabel htmlFor="new-app-name">Name</FieldLabel>
                    <Input id="new-app-name" value={draftName} onChange={(e) => handleNameChange(e.target.value)} />
                </Field>
                <Field>
                    <FieldLabel htmlFor="new-app-identifier">Identifier</FieldLabel>
                    <Input
                        id="new-app-identifier"
                        value={draftIdentifier}
                        onChange={(e) => handleIdentifierChange(e.target.value)}
                        className="font-mono"
                    />
                    <FieldDescription>
                        Used in URLs and the infraConfig snippet. Lowercase letters, numbers, and hyphens.
                        Can't be changed after creation.
                    </FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="new-app-type">Type</FieldLabel>
                    <Select
                        id="new-app-type"
                        aria-label="Type"
                        selectedKey={draftType}
                        onSelectionChange={(key) => setDraftType(key as AppType)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {APP_TYPES.map((type) => (
                                <SelectItem key={type} id={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                {error && <p className="text-xs text-destructive">{error}</p>}
            </FieldGroup>
        </DialogWidget>
    )
}
