import { m } from "@/paraglide/messages"
import { reveal } from "@lib/motion"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/legal/privacy-policy"
)({
    component: RouteComponent,
})

function RouteComponent() {
    const sections = [
        {
            heading: "1. Overview",
            body: "This policy explains what data Pherus Inc. collects across pherus.org and our other products, and how we use it. It doesn't cover third-party sites we link to.",
        },
        {
            heading: "2. This site (pherus.org)",
            body: "pherus.org itself doesn't have a sign-up form, account system, or data layer — browsing it doesn't create an account or submit any personal data to us. It sets one cookie, to remember your language preference; see our Cookie policy for details.",
        },
        {
            heading:
                "3. Pherus accounts (account.pherus.org)",
            body: "If you create a Pherus account, we collect what's needed to run it: your email address, authentication credentials (handled securely, never stored as plain text), and, if you enable them, two-factor authentication or passkey data. We also keep a record of your active sessions and devices so you can review and revoke them yourself.",
        },
        {
            heading: "4. How we use your information",
            body: "We use account data to operate, secure, and improve our services — for example, to authenticate you, prevent abuse, and let you manage your own sessions. We do not sell your personal data, and we don't run advertising or analytics trackers on our sites.",
        },
        {
            heading: "5. Cookies and local storage",
            body: "See our Cookie policy for the full list of what we store in your browser and why.",
        },
        {
            heading: "6. Where your data is stored",
            body: "Our infrastructure runs on Cloudflare (Workers, D1, KV, and R2). Data may be processed or stored on Cloudflare's global network as part of operating our services.",
        },
        {
            heading: "7. Data retention",
            body: "We keep account data for as long as your account is active, and for [retention period] after deletion for security and legal purposes, unless a longer period is required by law.",
        },
        {
            heading: "8. Your rights",
            body: "Depending on where you live, you may have the right to access, correct, export, or delete your personal data. You can manage most of this yourself from your account's security settings, or contact us using the details below.",
        },
        {
            heading: "9. Children's privacy",
            body: "Our services aren't directed at children under 13 (or the minimum age in your jurisdiction), and we don't knowingly collect their data.",
        },
        {
            heading: "10. Changes to this policy",
            body: "We may update this policy from time to time. We'll update the date below when we do.",
        },
        {
            heading: "11. Contact us",
            body: "Questions about this policy, or requests about your data, can be sent to [contact email].",
        },
    ]

    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    <motion.h1
                        {...reveal}
                        className="font-black"
                    >
                        {m["nav.legal.privacy-policy"]()}
                    </motion.h1>

                    <motion.p
                        {...reveal}
                        className="text-sm text-muted-foreground"
                    >
                        Last updated: 2026-09-16
                    </motion.p>
                </div>

                <div className="mx-auto flex w-full md:max-w-3xl flex-col gap-5">
                    {sections.map((section) => (
                        <div
                            key={section.heading}
                            className="flex flex-col gap-1"
                        >
                            <h2 className="text-base font-black">
                                {section.heading}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {section.body}
                            </p>
                        </div>
                    ))}

                    <p className="text-sm text-muted-foreground">
                        See also our{" "}
                        <Link
                            to="/legal/terms-of-service"
                            className="underline"
                        >
                            Terms of service
                        </Link>{" "}
                        and{" "}
                        <Link
                            to="/legal/cookie-policy"
                            className="underline"
                        >
                            Cookie policy
                        </Link>
                        .
                    </p>
                </div>
            </section>
        </article>
    )
}
