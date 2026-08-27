// Uses the Workers runtime's own HTMLRewriter (a Rust HTML parser, built
// into the platform, zero bundle cost) instead of the `sanitize-html` npm
// package — that package's entry point unconditionally pulls in postcss
// (for `style` attribute parsing, a code path this allowlist never
// reaches — `style` was never an allowed attribute) plus htmlparser2 and
// entities, ~140kb of dead weight in a Workers script that's otherwise
// well under the free-tier size limit without it. Same allowlist, same
// security posture (allowlist-only: anything not explicitly listed here —
// <script>, event-handler attributes, style, href/xlink:href — is
// stripped either way), just enforced by a different, native parser.
//
// HTMLRewriter parses using HTML rules, which are case-insensitive for
// tag/attribute names — but a handful of real SVG tag/attribute names are
// case-sensitive (linearGradient, viewBox, ...) and must come out exactly
// that way or the SVG won't render. Rather than assume how HTMLRewriter
// normalizes what it doesn't touch, this explicitly re-asserts the correct
// casing on every allowed element/attribute, so output correctness doesn't
// depend on an unverified internal detail of the parser.
const CANONICAL_TAGS: Record<string, string> = {
    svg: "svg",
    g: "g",
    path: "path",
    circle: "circle",
    rect: "rect",
    line: "line",
    polygon: "polygon",
    polyline: "polyline",
    ellipse: "ellipse",
    defs: "defs",
    title: "title",
    desc: "desc",
    lineargradient: "linearGradient",
    radialgradient: "radialGradient",
    stop: "stop",
    clippath: "clipPath",
    mask: "mask",
    text: "text",
    tspan: "tspan",
}

const ALLOWED_ATTRIBUTES = new Set([
    "id",
    "class",
    "d",
    "fill",
    "fill-rule",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "viewbox",
    "xmlns",
    "width",
    "height",
    "x",
    "y",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "x1",
    "y1",
    "x2",
    "y2",
    "points",
    "transform",
    "offset",
    "stop-color",
    "stop-opacity",
    "opacity",
    "gradientunits",
    "clip-path",
    "mask",
])

// HTMLRewriter always serializes attribute names lowercase (an HTML
// convention lol-html doesn't special-case for SVG/XML) — confirmed by
// testing against a live upload: setAttribute("viewBox", ...) still comes
// out as `viewbox=`. tagName reassignment does NOT have this problem
// (verified the same way: linearGradient/clipPath come out correctly
// cased), so only these two attributes need a post-process fixup on the
// final string.
const ATTRIBUTE_CASING_FIXUPS: [RegExp, string][] = [
    [/\bviewbox=/g, "viewBox="],
    [/\bgradientunits=/g, "gradientUnits="],
]

// this tsconfig's `lib` also includes the DOM lib (for other browser-shaped
// types this package needs elsewhere), which declares its own ambient
// global `Element` — merged with @cloudflare/workers-types' own ambient
// `Element`, the combined type picks up DOM's readonly tagName and
// NamedNodeMap-shaped attributes instead of the real HTMLRewriter runtime
// shape (readonly tagName: false, attributes: IterableIterator<string[]> —
// confirmed directly against @cloudflare/workers-types' own source). This
// local type + cast sidesteps the ambient collision; it's not changing
// what's actually called at runtime, just what TS is told to expect here.
type RewriterElement = {
    tagName: string
    attributes: Iterable<[string, string]>
    removeAttribute(name: string): unknown
    remove(): unknown
}

export async function sanitizeSvg(svg: string): Promise<string> {
    const response = new HTMLRewriter()
        .onDocument({
            comments(comment) {
                comment.remove()
            },
        })
        .on("*", {
            element(elIn) {
                const el = elIn as unknown as RewriterElement
                const canonicalTag = CANONICAL_TAGS[el.tagName.toLowerCase()]
                if (!canonicalTag) {
                    el.remove()
                    return
                }
                el.tagName = canonicalTag

                for (const [name] of [...el.attributes]) {
                    if (!ALLOWED_ATTRIBUTES.has(name.toLowerCase())) {
                        el.removeAttribute(name)
                    }
                }
            },
        })
        .transform(new Response(svg))
    let html = await response.text()
    for (const [pattern, replacement] of ATTRIBUTE_CASING_FIXUPS) {
        html = html.replace(pattern, replacement)
    }
    return html
}
