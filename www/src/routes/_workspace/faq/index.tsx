import { seo } from '@/lib/seo'
import { Badge } from '@infra/ui/components/badge'
import { cn } from '@infra/ui/lib/utils'
import { ViewController } from '@infra/ui/widgets/view-controller'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/_workspace/faq/')({
  head: () =>
    seo({
      title: 'FAQ',
      description: 'Straight answers about what Pherus actually is, and isn\'t, yet.',
      path: '/faq',
    }),
  component: RouteComponent,
})

function RouteComponent() {
  const sections = useMemo(
    () => [
      {
        label: 'General',
        items: [
          {
            question: 'What is Pherus?',
            answer:
              'A research and innovation company built around one principle, Open Knowledge, applied across cosmetics, culture, healthcare, aerospace, devices, storage, and agriculture. One origin, many things being built.',
          },
          {
            question: 'What does "Open Knowledge" mean?',
            answer:
              'The operating principle behind everything here: understand the problem first, then share what was learned along the way, ideas, research, and most of the code included, not just the finished result.',
          },
          {
            question: 'Where can I see the actual work, not just the pitch?',
            answer:
              'The blog. Every post is a real research note from whoever built it, published as it happens, corrections included when something turns out wrong.',
          },
        ],
      },
      {
        label: 'Status',
        items: [
          {
            question: 'What actually exists today?',
            answer:
              'Infra and Accounts are live. Seer and Transspace are in development. Everything else is still in planning, honestly labeled as such wherever it shows up on this site.',
          },
          {
            question: "Why is there barely a paragraph for some of these?",
            answer:
              "Because that's genuinely where they are. More gets written about something as more real work happens on it, not before. Pherus homes, for example, is deliberately the thinnest page on the site right now.",
          },
          {
            question: 'Is any of this available to buy or use right now?',
            answer:
              'Not yet. Seer is the closest to launching. Everything under "in planning" is a real intention, not a live product.',
          },
        ],
      },
      {
        label: 'Getting involved',
        items: [
          {
            question: 'How do I get involved?',
            answer:
              'Join the discussions, follow the GitHub organizations, or report a bug. All three are linked from the homepage community section.',
          },
          {
            question: 'Can I contribute to something specific?',
            answer:
              "Depends which one. Seer and Transspace publish their process openly on the blog, which is the best place to see what's actually open for input right now.",
          },
        ],
      },
    ],
    []
  )

  return (
    <ViewController
      className="md:max-w-4xl"
      heading={
        <ViewController.Heading
          title="FAQ"
          description="Straight answers about what Pherus actually is, and isn't, yet."
        />
      }
    >
      <div className="flex flex-col gap-12">
        {sections.map((section) => (
          <div key={section.label} className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {section.label}
              </h2>
              <span className="h-px flex-1 bg-border/35" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {section.items.map((faq, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex flex-col gap-2 pl-4 border-l-2 border-primary/30',
                    'hover:border-primary transition-colors'
                  )}
                >
                  <h3 className="text-base font-semibold leading-snug">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-border/35">
        <Badge variant="outline">Still growing</Badge>
        <p className="text-xs text-muted-foreground">
          More questions get answered here as real ones come in, not invented ahead of time.
        </p>
      </div>
    </ViewController>
  )
}
