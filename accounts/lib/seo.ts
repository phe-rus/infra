type seoProps = {
    title: string
    siteName?: string
    description?: string
    image?: string
    keywords?: string[]
} & {
    type?:
    | "website"
    | "article"
    | "video.other"
    | "book"
    | "game"
    | "article:section"
    | "article:tag"
}
export const seo = ({
    siteName = "Account",
    title,
    description,
    keywords,
    image,
    type = "website",
}: seoProps) => {
    const tags = [
        { title },
        ...(description ? [{ name: "description", content: description }] : []),
        ...(keywords ? [{ name: "keywords", content: keywords.join(", ") }] : []),

        // OG tags
        { name: "og:type", content: type },
        { name: "og:title", content: title },
        ...(description ? [{ name: "og:description", content: description }] : []),
        { name: "og:site_name", content: siteName },

        // Twitter card tags
        { name: "twitter:title", content: title },
        ...(description ? [{ name: "twitter:description", content: description }] : []),
        ...(image
            ? [
                { name: "twitter:image", content: image },
                { name: "twitter:card", content: "summary_large_image" },
                { name: "og:image", content: image },
            ]
            : []),
    ]

    return tags
}
