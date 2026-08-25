import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import {
    paymentConfigOptions,
    paymentsOptions,
    walletBalancesOptions,
} from "@/domains/payments"
import { isAdminTier } from "@infra/auth/permissions"

export const Route = createFileRoute("/_workspace/billing")({
    beforeLoad: ({ context: { user } }) => {
        if (!isAdminTier(user.role ?? "")) {
            throw redirect({
                to: "/unauthorized",
                replace: true,
            })
        }
    },
    loader: async ({ context: { q } }) => {
        await Promise.all([
            q.ensureQueryData(paymentsOptions()),
            q.ensureQueryData(paymentConfigOptions()),
            q.ensureQueryData(walletBalancesOptions({ currency: "UGX" })),
        ])
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}
