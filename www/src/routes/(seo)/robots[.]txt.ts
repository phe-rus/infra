import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const robotsSchema = z.object({
    rules: z.array(
        z.object({
            userAgent: z.string().default("*"),
            allow: z.array(z.string()).optional(),
            disallow: z.array(z.string()).optional(),
        })
    ),
    sitemap: z.url(),
})

type RobotsConfig = z.infer<typeof robotsSchema>

function generateRobotsTxt(config: RobotsConfig): string {
    const blocks = config.rules.map((rule) => {
        const lines = [`User-agent: ${rule.userAgent}`]
        for (const path of rule.allow ?? [])
            lines.push(`Allow: ${path}`)
        for (const path of rule.disallow ?? [])
            lines.push(`Disallow: ${path}`)
        return lines.join("\n")
    })
    return [...blocks, `Sitemap: ${config.sitemap}`].join(
        "\n\n"
    )
}

export const Route = createFileRoute("/(seo)/robots.txt")({
    server: {
        handlers: {
            GET: ({ request }) => {
                const origin = new URL(request.url).origin
                const data = robotsSchema.parse({
                    rules: [
                        {
                            userAgent: "*",
                            allow: ["/"],
                            disallow: ["/api/"],
                        },
                    ],
                    sitemap: `${origin}/sitemap.xml`,
                })
                return new Response(generateRobotsTxt(data), {
                    headers: { "Content-Type": "text/plain" },
                })
            },
        },
    },
})
