import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { IconCardsFilled, IconInfoCircle } from "@tabler/icons-react"
import { cn } from "@infra/ui/lib/utils"
import { buttonVariants } from "@infra/ui/components/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@infra/ui/components/select"
import { statsQueryOptions, useStats } from "@/domains/stats"
import { consoleOptions, useConsole, CREATE_CLIENT_ID, ApplicationGrid } from "@/domains/console"
import { useWalletBalances } from "@/domains/payments"
import { ViewController, ContentView } from "@/components/views"

const PREFERRED_CURRENCIES = [
    "UGX",
    "USD",
    "KES",
    "ZMW",
    "NGN",
    "GHS",
    "XAF",
    "XOF",
    "RWF",
    "TZS",
    "MWK",
    "MZN",
    "CDF",
    "SLE",
]

export const Route = createFileRoute("/_workspace/")({
    loader: async ({ context: { q } }) => {
        await Promise.all([
            q.ensureQueryData(statsQueryOptions()),
            q.ensureQueryData(consoleOptions()),
        ])
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { session } = Route.useRouteContext()
    const { data: stats } = useStats()
    const { data: apps } = useConsole()

    const [currency, setCurrency] = useState("UGX")
    const { data: wallet } = useWalletBalances({ currency })

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title={`Good morning, ${session?.user?.name ?? "there!"}`}
                    description="Here's what's happening with your business"
                />
            }
        >
            <ContentView variant="elevated">
                <ContentView.Row className="gap-3 p-3">
                    <IconInfoCircle />
                    <ContentView.H2 className="flex items-center gap-1 text-sm">
                        Your code and connections all look good
                        <Link to="/logs" className="cursor-pointer hover:underline">
                            View status page
                        </Link>
                    </ContentView.H2>
                </ContentView.Row>
            </ContentView>

            <ContentView.Section>
                <ContentView.H1>Your business</ContentView.H1>
                <ContentView variant="elevated">
                    <ContentView.Row className="mx-auto w-full justify-evenly gap-5 p-5">
                        <ContentView.Header heading="Monthly active users" p="Last 30 days">
                            <h1>{stats.monthlyActiveUsers}</h1>
                        </ContentView.Header>
                        <ContentView.Divider />
                        <ContentView.Header heading="Total users" p="Current">
                            <h1>{stats.totalUsers}</h1>
                        </ContentView.Header>
                    </ContentView.Row>
                </ContentView>
            </ContentView.Section>

            <ContentView.Section>
                <ContentView.Row className="justify-between">
                    <ContentView.H2>Your applications</ContentView.H2>
                    <Link
                        to="/console/$client_id"
                        params={{ client_id: CREATE_CLIENT_ID }}
                        className={cn(buttonVariants({ size: "sm" }))}
                    >
                        Add application
                    </Link>
                </ContentView.Row>
                <ApplicationGrid data={apps} />
            </ContentView.Section>

            <ContentView variant="elevated" className="relative flex flex-col px-10 py-5">
                <IconCardsFilled className="size-18" />
                <ContentView.Row className="justify-between gap-3">
                    <h1 className="tracking-tight">Wallet balance</h1>
                </ContentView.Row>
                {wallet.total && (
                    <ContentView.P>
                        <ContentView.Span>
                            {wallet.total.amount.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                            })}{" "}
                        </ContentView.Span>
                        <ContentView.Sub>{wallet.total.currency}</ContentView.Sub>
                    </ContentView.P>
                )}
                <Select
                    aria-label="Preferred currency"
                    value={currency}
                    onChange={(key) => setCurrency(String(key))}
                >
                    <SelectTrigger
                        size="sm"
                        className={cn(
                            "w-38 rounded-full! bg-input!",
                            "border-0 absolute top-5 right-5"
                        )}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                        className={cn("max-h-40! rounded-md! px-1! *:no-scrollbar!", "pt-1 pb-20!")}
                    >
                        {PREFERRED_CURRENCIES.map((code) => (
                            <SelectItem key={code} id={code} className="rounded-full!">
                                {code}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </ContentView>
        </ViewController>
    )
}
