import { createFileRoute, Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { authSettingsQueryOptions } from "@/hooks/settingsHooks"
import { apiKeysQueryOptions, useCreateApiKey, useDeleteApiKey, useSetApiKeyEnabled } from "@/hooks/apiKeysHooks"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, type DataTableColumnDef } from "@/components/widgets/tables"
import { DialogWidget } from "@/components/widgets/dialog-widget"
import { EXPIRATION_OPTIONS, type ApiKey } from "@/types"
import { IconCheck, IconCopy, IconDotsVertical } from "@tabler/icons-react"
import { format } from "date-fns/format"
import { useMemo, useState } from "react"

export const Route = createFileRoute("/_workspace/api-keys")({
    loader: async ({ context: { q } }) => {
        await Promise.all([
            q.ensureQueryData(authSettingsQueryOptions()),
            q.ensureQueryData(apiKeysQueryOptions()),
        ])
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data: authSettings } = useSuspenseQuery(authSettingsQueryOptions())
    const { data: apiKeys } = useSuspenseQuery(apiKeysQueryOptions())
    const apiKeyEnabled = authSettings.apiKey
    const { mutateAsync: createApiKey } = useCreateApiKey()
    const { mutateAsync: setApiKeyEnabled } = useSetApiKeyEnabled()
    const { mutateAsync: deleteApiKey } = useDeleteApiKey()

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [draftName, setDraftName] = useState("")
    const [draftExpiration, setDraftExpiration] = useState<string>("never")
    const [revealedKey, setRevealedKey] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    async function handleCopyRevealedKey() {
        if (!revealedKey) return
        await navigator.clipboard.writeText(revealedKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

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

    const columns = useMemo(
        (): DataTableColumnDef<ApiKey>[] => [
            {
                accessorKey: "name",
                header: "Name",
                cell: ({ row }) => row.original.name ?? "Unnamed key",
            },
            {
                id: "prefix",
                header: "Key",
                enableColumnFilter: false,
                enableGlobalFilter: false,
                cell: ({ row }) => (
                    <code className="rounded-none bg-input/30 px-2 py-1 text-xs">
                        {(row.original.prefix ?? "") + (row.original.start ?? "")}••••••
                    </code>
                ),
            },
            {
                accessorKey: "enabled",
                header: "Status",
                cell: ({ row }) =>
                    row.original.enabled ? (
                        <Badge variant="outline">Enabled</Badge>
                    ) : (
                        <Badge variant="secondary">Disabled</Badge>
                    ),
            },
            {
                accessorKey: "expiresAt",
                header: "Expires",
                enableColumnFilter: false,
                cell: ({ row }) => (row.original.expiresAt ? format(row.original.expiresAt, "PPP") : "Never"),
            },
            {
                accessorKey: "lastRequest",
                header: "Last used",
                enableColumnFilter: false,
                cell: ({ row }) =>
                    row.original.lastRequest ? format(row.original.lastRequest, "PPP") : "Never",
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                enableColumnFilter: false,
                cell: ({ row }) => format(row.original.createdAt, "PPP"),
            },
            {
                id: "actions",
                enableColumnFilter: false,
                enableGlobalFilter: false,
                enableSorting: false,
                cell: ({ row }) => {
                    const key = row.original
                    return (
                        <DropdownMenuTrigger>
                            <Button type="button" variant="ghost" size="icon-xs" aria-label="Key actions">
                                <IconDotsVertical className="size-4" />
                            </Button>
                            <DropdownMenu aria-label="Key actions">
                                <DropdownMenuItem
                                    onAction={() => void setApiKeyEnabled({ data: { keyId: key.id, enabled: !key.enabled } })}
                                >
                                    {key.enabled ? "Disable" : "Enable"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onAction={() => void deleteApiKey({ data: { keyId: key.id } })}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </DropdownMenuTrigger>
                    )
                },
            },
        ],
        []
    )

    return (
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-2xl">
            <section>
                <div className='flex items-center gap-3'>
                    <h1 className="text-3xl md:text-4xl">API keys</h1>
                    <Button type="button" onClick={() => setDrawerOpen(true)}>
                        Create key
                    </Button>
                </div>
                <p className="text-muted-foreground">
                    Long-lived credentials for scripts and services to authenticate without signing in.
                </p>
            </section>

            {apiKeyEnabled ? (
                <>
                    <DataTable
                        aria-label="API keys"
                        columns={columns}
                        data={apiKeys}
                        getRowId={(key) => key.id}
                        emptyMessage="No API keys yet."
                        searchPlaceholder="Search by name…"
                    />

                    <DialogWidget
                        open={drawerOpen}
                        onOpenChange={setDrawerOpen}
                        title="Create an API key"
                        description="Give it a name so you can tell it apart later."
                        footer={
                            <Button
                                type="button"
                                isDisabled={!draftName.trim()}
                                onClick={() => void handleCreate()}
                            >
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
                                    aria-label="Expires"
                                    selectedKey={draftExpiration}
                                    onSelectionChange={(key) => setDraftExpiration(String(key))}
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

                    <DialogWidget
                        open={Boolean(revealedKey)}
                        onOpenChange={(open) => !open && setRevealedKey(null)}
                        title="Key created"
                        description="Copy this key now, you won't be able to see it again."
                        footer={
                            <Button type="button" onClick={() => setRevealedKey(null)}>
                                Done
                            </Button>
                        }
                    >
                        <code className="block rounded-none border border-input bg-input/30 p-3 text-xs break-all">
                            {revealedKey}
                        </code>
                        <Button type="button" variant="outline" onClick={() => void handleCopyRevealedKey()}>
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
                </>
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
