import { ViewController } from '@infra/ui/widgets/view-controller'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/_workspace/faq/')({
  component: RouteComponent,
})

function RouteComponent() {
  const faqs = useMemo(
    () => [
      {
        question: 'What is Pherus?',
        answer:
          "A research and innovation company built around one principle, Open Knowledge, applied across cosmetics, culture, healthcare, aerospace, devices, storage, and agriculture. Ten divisions, one origin.",
      },
      {
        question: 'What actually exists today?',
        answer:
          'Infra and Accounts are live. Seer and Transspace are in development. Everything else is still in planning, honestly labeled as such wherever it shows up on this site.',
      },
      {
        question: 'What does "Open Knowledge" mean?',
        answer:
          'The operating principle behind every division: understand the problem first, then share what was learned along the way, ideas, research, and most of the code included, not just the finished result.',
      },
      {
        question: 'Where can I see the actual work, not just the pitch?',
        answer:
          "The blog. Every post is a real research note from a division, published as it happens, corrections included when something turns out wrong.",
      },
      {
        question: 'How do I get involved?',
        answer:
          'Join the discussions, follow the GitHub organizations, or report a bug. All three are linked from the homepage community section.',
      },
    ],
    []
  )

  return (
    <ViewController
      className="md:max-w-5xl"
      heading={
        <ViewController.Heading
          title="FAQ"
          description="Straight answers about what Pherus actually is, and isn't, yet."
        />
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 p-4 rounded-2xl border border-border/35 bg-input/15"
          >
            <h2 className="text-base font-semibold">{faq.question}</h2>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </ViewController>
  )
}
