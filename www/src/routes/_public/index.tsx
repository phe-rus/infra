import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_public/")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <article className="flex flex-col">
            <h1>Hello world</h1>
        </article>
    )
}
