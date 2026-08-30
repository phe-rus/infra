import { resources } from '@/lib/config'
import { seo } from '@/lib/seo'
import { Badge } from '@infra/ui/components/badge'
import { ViewController } from '@infra/ui/widgets/view-controller'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/r/$slug')({
  head: ({ params }) => {
    const resource = resources.find((item) => item.slug === params.slug)
    return {
      meta: seo({
        title: resource?.label ?? 'Not found',
        description: resource?.tagline,
      }),
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const resource = resources.find((item) => item.slug === slug)

  if (!resource) {
    return <ViewController heading={<ViewController.Heading title="Not found" />} />
  }

  return (
    <ViewController
      className="md:max-w-4xl"
      heading={
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{resource.tag}</Badge>
          </div>
          <ViewController.Heading title={resource.label} description={resource.tagline} />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {resource.body.map((block, idx) => {
          if ('h2' in block) {
            return <h2 key={idx}>{block.h2}</h2>
          }
          if ('ul' in block) {
            return (
              <ul key={idx} className="list-disc pl-5 flex flex-col gap-1">
                {block.ul.map((item, itemIdx) => (
                  <li key={itemIdx}>{item}</li>
                ))}
              </ul>
            )
          }
          return <p key={idx}>{block.p}</p>
        })}
      </div>
    </ViewController>
  )
}
