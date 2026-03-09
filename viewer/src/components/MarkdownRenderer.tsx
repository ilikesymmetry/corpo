import { md } from '../lib/markdown'

interface Props {
  content: string
}

export function MarkdownRenderer({ content }: Props) {
  // Strip thread anchors before rendering
  const cleaned = content.replace(/<!-- thread:[a-f0-9]+ -->/g, '')
  const html = md.render(cleaned)
  return (
    <div
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
