import { Preview, type BasiccnContent } from "@infra/rich-text"

/** Renders a stored `BasiccnContent` through the shared rich-text preview, so
 * every prose block in this app (legal pages, license bodies, a showcase
 * resource's deep dive) shares one renderer with the rest of the codebase
 * instead of a page-local reimplementation. */
export function DocPreview({ doc }: { doc: BasiccnContent }) {
    return <Preview content={JSON.stringify(doc)} />
}
