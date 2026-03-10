import { useEffect, useState, useCallback, useRef } from 'react'
import { useFile } from '../hooks/useFile'
import { MarkdownRenderer } from './MarkdownRenderer'
import { CommentInput } from './CommentInput'
import { ThreadSidebar } from './ThreadPanel'
import { commitFile, resolveThread } from '../lib/api'
import { serializeFile, generateThreadId, insertThreadAnchor } from '../lib/serialize'
import { parseHeadingThreads } from '../lib/parse'
import type { FileMeta, Thread } from '../lib/parse'

interface SelectionState {
  text: string
  rect: DOMRect
  endLine: number
}

// Walk up from the selection's end node to find the nearest element
// stamped with data-line-end by the markdown-it source-map rule.
function getSelectionEndLine(range: Range): number | null {
  let node: Node | null = range.endContainer
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement
  while (node instanceof HTMLElement) {
    const v = node.dataset.lineEnd
    if (v !== undefined) return parseInt(v, 10)
    node = node.parentElement
  }
  return null
}

export function FileView({ id }: { id: string }) {
  const { file, loading, error } = useFile(id)

  const [localMeta, setLocalMeta] = useState<FileMeta | null>(null)
  const [localContent, setLocalContent] = useState<string | null>(null)
  const [selection, setSelection] = useState<SelectionState | null>(null)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  // Separate scroll ticks so each side only scrolls when triggered by the other side
  const [articleScrollTick, setArticleScrollTick] = useState(0)
  const [panelScrollTick, setPanelScrollTick] = useState(0)
  const articleRef = useRef<HTMLDivElement>(null)

  // Only scroll the article when triggered from the thread panel side
  useEffect(() => {
    if (!activeThreadId || !articleRef.current || articleScrollTick === 0) return
    const article = articleRef.current
    const headings = article.querySelectorAll<HTMLElement>('[data-thread-ids]')
    for (const h of headings) {
      const ids = h.dataset.threadIds?.split(',') ?? []
      if (!ids.includes(activeThreadId)) continue
      const articleRect = article.getBoundingClientRect()
      const headingRect = h.getBoundingClientRect()
      const scrollTop = article.scrollTop + headingRect.top - articleRect.top - articleRect.height / 2 + headingRect.height / 2
      article.scrollTo({ top: scrollTop, behavior: 'smooth' })
      break
    }
  }, [articleScrollTick])

  function activateFromHeading(id: string) {
    setActiveThreadId(id)
    setPanelScrollTick(t => t + 1)
  }

  function activateFromThread(id: string) {
    setActiveThreadId(id)
    setArticleScrollTick(t => t + 1)
  }

  // Reset local state on file load or id change
  useEffect(() => {
    if (file) {
      setLocalMeta(file.meta)
      setLocalContent(file.content)
      setSelection(null)
    }
  }, [file])

  useEffect(() => {
    setSelection(null)
  }, [id])

  useEffect(() => {
    if (localMeta?.title) document.title = `${localMeta.title} — corpo`
  }, [localMeta?.title])

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) return
    if (!articleRef.current?.contains(sel.anchorNode)) return
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const endLine = getSelectionEndLine(range)
    if (endLine === null) return  // selection not inside a rendered block
    setSelection({ text: sel.toString(), rect, endLine })
  }, [])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('[data-comment-input]')) {
      setSelection(null)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [handleMouseDown])

  async function handleCommentSubmit(body: string) {
    if (!localMeta || localContent === null || !selection) return

    const threadId = generateThreadId()
    const thread: Thread = {
      author: 'me',
      timestamp: new Date().toISOString(),
      body,
    }

    const newMeta: FileMeta = {
      ...localMeta,
      threads: { ...(localMeta.threads ?? {}), [threadId]: thread },
    }
    const newContent = insertThreadAnchor(localContent, selection.endLine, threadId)

    setLocalMeta(newMeta)
    setLocalContent(newContent)
    setSelection(null)
    window.getSelection()?.removeAllRanges()

    await commitFile(id, serializeFile(newMeta, newContent)).catch(console.error)
  }

  async function handleResolve(threadId: string) {
    if (!localMeta || localContent === null) return

    const newMeta: FileMeta = { ...localMeta, threads: { ...(localMeta.threads ?? {}) } }
    delete newMeta.threads![threadId]
    if (Object.keys(newMeta.threads!).length === 0) delete newMeta.threads

    const newContent = localContent
      .replace(`<!-- thread:${threadId} -->\n`, '')
      .replace(`<!-- thread:${threadId} -->`, '')

    setLocalMeta(newMeta)
    setLocalContent(newContent)
    if (activeThreadId === threadId) setActiveThreadId(null)

    await resolveThread(id, threadId).catch(console.error)
  }

  async function handleReply(threadId: string, body: string) {
    if (!localMeta || localContent === null) return
    const thread = (localMeta.threads ?? {})[threadId]
    if (!thread) return
    const reply = { author: 'me', timestamp: new Date().toISOString(), body }
    const newMeta: FileMeta = {
      ...localMeta,
      threads: {
        ...(localMeta.threads ?? {}),
        [threadId]: { ...thread, replies: [...(thread.replies ?? []), reply] },
      },
    }
    setLocalMeta(newMeta)
    await commitFile(id, serializeFile(newMeta, localContent)).catch(console.error)
  }

  if (loading) return <div className="p-8 text-gray-500">Loading…</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>
  if (!localMeta || localContent === null) return null

  const threads = localMeta.threads ?? {}
  const headingThreads = parseHeadingThreads(localContent)

  const hasThreads = Object.keys(threads).length > 0

  return (
    <div className="relative h-full">
      <article
        ref={articleRef}
        onMouseUp={handleMouseUp}
        className="h-full overflow-y-auto px-8 py-12"
      >
        <div className="max-w-2xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold">{localMeta.title}</h1>
            {localMeta.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">{localMeta.description}</p>
            )}
          </header>
          <MarkdownRenderer
            content={localContent}
            headingThreads={headingThreads}
            activeThreadId={activeThreadId}
            onActivate={activateFromHeading}
          />
        </div>
      </article>

      {hasThreads && <ThreadSidebar threads={threads} activeThreadId={activeThreadId} onActivate={activateFromThread} scrollTick={panelScrollTick} onReply={handleReply} onResolve={handleResolve} collapsed={panelCollapsed} onCollapsedChange={setPanelCollapsed} />}

      {selection && (
        <CommentInput
          rect={selection.rect}
          onSubmit={handleCommentSubmit}
          onCancel={() => {
            setSelection(null)
            window.getSelection()?.removeAllRanges()
          }}
        />
      )}
    </div>
  )
}
