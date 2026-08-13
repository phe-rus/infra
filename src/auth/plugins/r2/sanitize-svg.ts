import sanitizeHtml from "sanitize-html"

const ALLOWED_SVG_TAGS = [
    "svg", "g", "path", "circle", "rect", "line", "polygon", "polyline",
    "ellipse", "defs", "title", "desc", "linearGradient", "radialGradient",
    "stop", "clipPath", "mask", "text", "tspan",
]

const ALLOWED_SVG_ATTRIBUTES = {
    "*": [
        "id", "class", "d", "fill", "fill-rule", "stroke", "stroke-width",
        "stroke-linecap", "stroke-linejoin", "viewBox", "xmlns", "width",
        "height", "x", "y", "cx", "cy", "r", "rx", "ry", "x1", "y1", "x2",
        "y2", "points", "transform", "offset", "stop-color", "stop-opacity",
        "opacity", "gradientUnits", "clip-path", "mask",
    ],
}

export function sanitizeSvg(svg: string): string {
    return sanitizeHtml(svg, {
        allowedTags: ALLOWED_SVG_TAGS,
        allowedAttributes: ALLOWED_SVG_ATTRIBUTES,
        disallowedTagsMode: "discard",
    })
}
