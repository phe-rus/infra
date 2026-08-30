type SeoProps = {
    title: string
    description?: string
    image?: string
    keywords?: string[]
    type?: "website" | "article"
}

export const seo = ({
    title,
    description,
    keywords,
    image = "/og.png",
    type = "website",
}: SeoProps) => {
    const fullTitle = title === "Pherus" ? title : `${title} · Pherus`

    return [
        { title: fullTitle },
        ...(description ? [{ name: "description", content: description }] : []),
        ...(keywords ? [{ name: "keywords", content: keywords.join(", ") }] : []),

        // OG tags
        { name: "og:type", content: type },
        { name: "og:title", content: fullTitle },
        ...(description ? [{ name: "og:description", content: description }] : []),
        { name: "og:site_name", content: "Pherus" },
        { name: "og:image", content: image },

        // Twitter card tags
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: fullTitle },
        ...(description ? [{ name: "twitter:description", content: description }] : []),
        { name: "twitter:image", content: image },
    ]
}
