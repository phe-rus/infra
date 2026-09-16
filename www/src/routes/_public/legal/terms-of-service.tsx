import { m } from "@/paraglide/messages"
import { reveal } from "@lib/motion"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/legal/terms-of-service"
)({
    component: RouteComponent,
})

function RouteComponent() {
    const sections = [
        {
            heading: "1. Acceptance of these terms",
            body: "By accessing or using pherus.org, account.pherus.org, or any other Pherus product, you agree to these Terms of Service. If you do not agree, do not use our services.",
        },
        {
            heading: "2. Our services",
            body: "Pherus is a practical research, sciences, innovation, and technology company. Our products (including Pass, Health, Collective, Software, Transspace, and others listed on our showcase page) are at various stages of development — some active, some in development, some still in planning — and are provided as described on each product's own page.",
        },
        {
            heading: "3. Accounts and security",
            body: "Some Pherus products require a Pherus account, managed through account.pherus.org. You're responsible for keeping your credentials secure, including any two-factor authentication or passkeys you set up. You can review and manage your active sessions and devices at any time from your account's security settings.",
        },
        {
            heading: "4. Acceptable use",
            body: "You agree not to use our services to violate any law, infringe anyone's rights, distribute malware, or interfere with the normal operation of our systems.",
        },
        {
            heading: "5. Intellectual property",
            body: "Where Pherus publishes source code under an open-source license, that code is licensed as described on our Licenses page, not under these Terms. Pherus product names, logos, and branding remain the property of Pherus Inc.",
        },
        {
            heading: "6. Third-party links and services",
            body: "Our sites may link to third-party services we don't control. We aren't responsible for the content, policies, or practices of any third party.",
        },
        {
            heading: "7. Disclaimer of warranties",
            body: 'Our services are provided "as is" and "as available," without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.',
        },
        {
            heading: "8. Limitation of liability",
            body: "To the fullest extent permitted by law, Pherus Inc. is not liable for any indirect, incidental, special, or consequential damages arising from your use of our services.",
        },
        {
            heading: "9. Governing law",
            body: "These Terms are governed by the laws of [jurisdiction], without regard to conflict-of-law principles.",
        },
        {
            heading: "10. Changes to these terms",
            body: "We may update these Terms from time to time. We'll update the date below when we do; continued use of our services after a change means you accept the updated Terms.",
        },
        {
            heading: "11. Contact us",
            body: "Questions about these Terms can be sent to [contact email].",
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
                        {m["nav.legal.terms-of-service"]()}
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
                            to="/legal/privacy-policy"
                            className="underline"
                        >
                            Privacy policy
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
