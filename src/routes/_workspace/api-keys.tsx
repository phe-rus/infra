import { createFileRoute, Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { apiKeysQueryOptions } from "@/functions/apiKeysFn"
import { authSettingsQueryOptions } from "@/functions/settingsFn"
import { useCreateApiKey, useDeleteApiKey, useSetApiKeyEnabled } from "@/hooks/apiKeysHooks"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/widgets/tables"
import { DialogWidget } from "@/components/widgets/dialog-widget"
import { RevealApiKeyDialog, getApiKeyColumns } from "@/components/dashboard/api-keys"
import { useState } from "react"

const EXPIRATION_OPTIONS = [
    { id: "never", label: "Never", seconds: null },
    { id: "2592000", label: "30 days", seconds: 60 * 60 * 24 * 30 },
    { id: "7776000", label: "90 days", seconds: 60 * 60 * 24 * 90 },
    { id: "31536000", label: "1 year", seconds: 60 * 60 * 24 * 365 },
] as const

export const Route = createFileRoute("/_workspace/api-keys")({
    loader: async ({ context: { q } }) => {
        const authSettings = await q.ensureQueryData(authSettingsQueryOptions())
        if (authSettings.apiKey) {
            await q.ensureQueryData(apiKeysQueryOptions())
        }
        return { apiKeyEnabled: authSettings.apiKey }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { apiKeyEnabled } = Route.useLoaderData()

    return (
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-2xl">
            <section>
                <h1 className="text-3xl md:text-4xl">API keys</h1>
                <p className="text-muted-foreground">
                    Long-lived credentials for scripts and services to authenticate without signing in.
                </p>
            </section>

            {apiKeyEnabled ? (
                <ApiKeysContent />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>API keys are turned off</CardTitle>
                        <CardDescription>
                            Enable the API keys sign-in method on the{" "}
                            <Link to="/providers" className="underline">
                                Providers
                            </Link>{" "}
                            page to create one.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </article>
    )
}

function ApiKeysContent() {
    const { data: apiKeys } = useSuspenseQuery(apiKeysQueryOptions())
    const { mutateAsync: createApiKey } = useCreateApiKey()
    const { mutateAsync: setApiKeyEnabled } = useSetApiKeyEnabled()
    const { mutateAsync: deleteApiKey } = useDeleteApiKey()

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [draftName, setDraftName] = useState("")
    const [draftExpiration, setDraftExpiration] = useState<string>("never")
    const [revealedKey, setRevealedKey] = useState<string | null>(null)

    async function handleCreate() {
        const option = EXPIRATION_OPTIONS.find((o) => o.id === draftExpiration)
        const created = await createApiKey({
            data: { name: draftName.trim(), expiresIn: option?.seconds ?? null },
        })
        setDraftName("")
        setDraftExpiration("never")
        setDrawerOpen(false)
        setRevealedKey(created.key)
    }

    const columns = getApiKeyColumns({
        onToggleEnabled: (keyId, enabled) => void setApiKeyEnabled({ data: { keyId, enabled } }),
        onDelete: (keyId) => void deleteApiKey({ data: { keyId } }),
    })

    return (
        <>
            <div>
                <Button type="button" onClick={() => setDrawerOpen(true)}>
                    Create key
                </Button>
            </div>

            <DataTable
                aria-label="API keys"
                columns={columns}
                data={apiKeys}
                emptyMessage="No API keys yet."
                searchPlaceholder="Search by name…"
            />

            <DialogWidget
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                title="Create an API key"
                description="Give it a name so you can tell it apart later."
                footer={
                    <Button type="button" isDisabled={!draftName.trim()} onClick={() => void handleCreate()}>
                        Create key
                    </Button>
                }
            >
                <FieldGroup className="grid grid-cols-1 gap-3">
                    <Field>
                        <FieldLabel htmlFor="new-key-name">Name</FieldLabel>
                        <Input
                            id="new-key-name"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            placeholder="e.g. CI deploy key"
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="new-key-expiration">Expires</FieldLabel>
                        <Select
                            id="new-key-expiration"
                            value={draftExpiration}
                            onChange={(key) => setDraftExpiration(String(key))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {EXPIRATION_OPTIONS.map((option) => (
                                    <SelectItem key={option.id} id={option.id}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>
            </DialogWidget>

            <RevealApiKeyDialog apiKey={revealedKey} onClose={() => setRevealedKey(null)} />
        </>
    )
}
