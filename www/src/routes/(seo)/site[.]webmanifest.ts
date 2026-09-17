import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const webmanifestSchema = z.object({
    name: z.string(),
    short_name: z.string(),
    icons: z.array(
        z.object({
            src: z.string(),
            sizes: z.string(),
            type: z.string(),
            purpose: z.string().optional(),
        })
    ),
    start_url: z.string(),
    display: z.enum(["standalone", "fullscreen", "minimal-ui", "browser"]),
    background_color: z.string(),
    theme_color: z.string(),
})

type WebmanifestConfig = z.infer<typeof webmanifestSchema>

export const Route = createFileRoute("/(seo)/site.webmanifest")({
    server: {
        handlers: {
            GET: () => {
                const manifestData: WebmanifestConfig = webmanifestSchema.parse({
                    name: "Pherus",
                    short_name: "Pherus",
                    icons: [
                        {
                            src: "/og.png",
                            sizes: "192x192",
                            type: "image/png",
                        },
                        {
                            src: "/og.png",
                            sizes: "512x512",
                            type: "image/png",
                        },
                    ],
                    start_url: "/",
                    display: "standalone",
                    background_color: "#ffffff",
                    theme_color: "#000000",
                })

                return new Response(JSON.stringify(manifestData, null, 2), {
                    headers: {
                        "Content-Type": "application/manifest+json",
                        "Cache-Control": "public, max-age=86400, s-maxage=86400",
                    },
                })
            },
        },
    },
})