import { useRef, useEffect } from 'react'
import { md } from '../lib/markdown'

interface Props {
  content: string
  headingThreads?: Record<string, string[]>
  activeThreadId?: string | null
  onActivate?: (threadId: string | null) => void
}

export function MarkdownRenderer({ content, headingThreads = {}, activeThreadId, onActivate }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const cleaned = content.replace(/<!-- thread:[a-f0-9]+ -->/g, '')
  const html = md.render(cleaned)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    container.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
      const el = h as HTMLElement
      const line = el.dataset.line ?? ''
      const ids = headingThreads[line]
      el.removeAttribute('data-thread-ids')
      el.classList.remove('threaded-heading', 'threaded-heading-active')
      if (!ids) return
      el.dataset.threadIds = ids.join(',')
      el.classList.add('threaded-heading')
      if (ids.some(id => id === activeThreadId)) el.classList.add('threaded-heading-active')
    })
  })

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const h = (e.target as HTMLElement).closest('h1,h2,h3,h4,h5,h6') as HTMLElement | null
    if (!h?.dataset.threadIds) return
    const ids = h.dataset.threadIds.split(',')
    onActivate?.(ids[0])
  }

  return (
    <div
      ref={ref}
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={handleClick}
    />
  )
}
