import type { JSONContent } from "@tiptap/core"
import type { ReactNode } from "react"

export type TiptapDoc = JSONContent

function renderMarks(
    text: string,
    marks: JSONContent["marks"]
): ReactNode {
    return (marks ?? []).reduce<ReactNode>((node, mark) => {
        switch (mark.type) {
            case "bold":
                return <strong>{node}</strong>
            case "italic":
                return <em>{node}</em>
            case "code":
                return <code>{node}</code>
            case "link":
                return (
                    <a
                        href={mark.attrs?.href}
                        className="underline"
                    >
                        {node}
                    </a>
                )
            default:
                return node
        }
    }, text)
}

function renderNode(
    node: JSONContent,
    key: number
): ReactNode {
    const children = () =>
        node.content?.map((child, i) => renderNode(child, i))

    switch (node.type) {
        case "text":
            return (
                <span key={key}>
                    {renderMarks(node.text ?? "", node.marks)}
                </span>
            )
        case "hardBreak":
            return <br key={key} />
        case "paragraph":
            return <p key={key}>{children()}</p>
        case "heading": {
            const level = node.attrs?.level ?? 2
            const Tag = `h${level}` as "h2"
            return <Tag key={key}>{children()}</Tag>
        }
        case "bulletList":
            return <ul key={key}>{children()}</ul>
        case "orderedList":
            return <ol key={key}>{children()}</ol>
        case "listItem":
            return <li key={key}>{children()}</li>
        case "codeBlock":
            return (
                <pre key={key} data-not-typeset>
                    {node.content
                        ?.map((c) => c.text)
                        .join("")}
                </pre>
            )
        case "table":
            return (
                <div key={key} className="typeset-scroll">
                    <table>
                        <tbody>{children()}</tbody>
                    </table>
                </div>
            )
        case "tableRow":
            return <tr key={key}>{children()}</tr>
        case "tableHeader":
            return <th key={key}>{children()}</th>
        case "tableCell":
            return <td key={key}>{children()}</td>
        case "blockquote":
            return (
                <blockquote key={key}>
                    {children()}
                </blockquote>
            )
        default:
            return null
    }
}

export function renderDoc(doc: TiptapDoc): ReactNode {
    return doc.content?.map((node, i) => renderNode(node, i))
}
