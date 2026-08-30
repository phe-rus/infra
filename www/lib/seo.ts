const SITE_URL = "https://pherus.org"

type SeoProps = {
    title: string
    description?: string
    image?: string
    keywords?: string[]
    type?: "website" | "article"
    path?: string
    publishedTime?: string
}

export const seo = ({
    title,
    description,
    keywords,
    image = "/og.png",
    type = "website",
    path = "/",
    publishedTime,
}: SeoProps) => {
    const fullTitle = title === "Pherus" ? title : `${title} · Pherus`
    const absoluteImage = image.startsWith("http") ? image : `${SITE_URL}${image}`
    const canonicalUrl = `${SITE_URL}${path === "/" ? "" : path}`

    const meta = [
        { title: fullTitle },
        ...(description ? [{ name: "description", content: description }] : []),
        ...(keywords ? [{ name: "keywords", content: keywords.join(", ") }] : []),

        // OG tags
        { name: "og:type", content: type },
        { name: "og:title", content: fullTitle },
        ...(description ? [{ name: "og:description", content: description }] : []),
        { name: "og:site_name", content: "Pherus" },
        { name: "og:image", content: absoluteImage },
        { name: "og:url", content: canonicalUrl },
        ...(publishedTime ? [{ name: "article:published_time", content: publishedTime }] : []),

        // Twitter card tags
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: fullTitle },
        ...(description ? [{ name: "twitter:description", content: description }] : []),
        { name: "twitter:image", content: absoluteImage },
    ]

    const links = [{ rel: "canonical", href: canonicalUrl }]

    return { meta, links }
}

export const organizationJsonLd = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pherus",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    description:
        "Pherus is a research and innovation company built on Open Knowledge: understand the problem first, then share what was learned.",
})
