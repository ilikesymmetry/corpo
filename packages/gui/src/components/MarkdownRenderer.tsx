import { useRef, useEffect } from 'react'
import { md } from '../lib/markdown'

interface Props {
  content: string
  blockThreads?: Record<string, string[]>
  activeThreadId?: string | null
  onActivate?: (threadId: string | null) => void
}

export function MarkdownRenderer({ content, blockThreads = {}, activeThreadId, onActivate }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const cleaned = content.replace(/<!-- thread:[a-f0-9]+ -->/g, '')
  const html = md.render(cleaned)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    container.querySelectorAll<HTMLElement>('[data-line-end]').forEach(el => {
      const lineEnd = el.dataset.lineEnd ?? ''
      const ids = blockThreads[lineEnd]
      el.removeAttribute('data-thread-ids')
      el.classList.remove('threaded-block', 'threaded-block-active')
      if (!ids) return
      el.dataset.threadIds = ids.join(',')
      el.classList.add('threaded-block')
      if (ids.some(id => id === activeThreadId)) el.classList.add('threaded-block-active')
    })
  })

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const el = (e.target as HTMLElement).closest('[data-thread-ids]') as HTMLElement | null
    if (!el?.dataset.threadIds) return
    const ids = el.dataset.threadIds.split(',')
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
