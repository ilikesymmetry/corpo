import { useState, useRef, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import type { Thread } from '../lib/parse'

interface Props {
  threads: Record<string, Thread>
  activeThreadId?: string | null
  onActivate?: (id: string) => void
  scrollTick?: number
  onReply?: (threadId: string, body: string) => void
  onResolve?: (threadId: string) => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

function formatDate(ts: string) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  } catch { return ts }
}

function ReplyInput({ threadId, onReply }: { threadId: string; onReply: (threadId: string, body: string) => void }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const body = value.trim()
      if (!body) return
      onReply(threadId, body)
      setValue('')
    }
  }

  return (
    <div className="mt-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Reply"
        rows={1}
        className="w-full text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-2 py-1 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 leading-tight"
      />
    </div>
  )
}

export function ThreadSidebar({ threads, activeThreadId, onActivate, scrollTick = 0, onReply, onResolve, collapsed = false, onCollapsedChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const entries = Object.entries(threads)

  // Only scroll the panel when triggered from the heading side (via scrollTick)
  useEffect(() => {
    if (!activeThreadId || scrollTick === 0) return
    const card = cardRefs.current[activeThreadId]
    const container = scrollRef.current
    if (!card || !container) return
    const containerMid = container.clientHeight / 2
    const cardTop = card.offsetTop
    const cardMid = card.offsetHeight / 2
    container.scrollTo({ top: cardTop - containerMid + cardMid, behavior: 'smooth' })
  }, [scrollTick])

  if (entries.length === 0) return null

  const showReplyFor = (id: string) => id === activeThreadId

  return (
    <Sidebar right collapsed={collapsed} onCollapsedChange={onCollapsedChange ?? (() => {})}>
      <div ref={scrollRef} className="h-full overflow-y-auto py-12 px-4 space-y-6">
        {entries.map(([id, thread]) => (
          <div
            key={id}
            ref={el => { cardRefs.current[id] = el }}
            onClick={() => onActivate?.(id)}
            className={`relative group/card text-sm rounded-md p-2 -mx-2 transition-colors duration-150 cursor-pointer ${id === activeThreadId ? 'bg-amber-100/60 dark:bg-amber-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
          >
            {onResolve && (
              <button
                onClick={e => { e.stopPropagation(); onResolve(id) }}
                title="Resolve thread"
                className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity text-gray-300 hover:text-green-500 dark:text-gray-600 dark:hover:text-green-400"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,8 6,13 14,3" />
                </svg>
              </button>
            )}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-medium text-gray-800 dark:text-gray-200">{thread.author}</span>
              <span className="text-xs text-gray-400">{formatDate(thread.timestamp)}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {thread.body}
            </p>
            {thread.replies?.map((reply, i) => (
              <div key={i} className="mt-3 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{reply.author}</span>
                  <span className="text-xs text-gray-400">{formatDate(reply.timestamp)}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {reply.body}
                </p>
              </div>
            ))}
            {showReplyFor(id) && onReply && (
              <ReplyInput threadId={id} onReply={onReply} />
            )}
          </div>
        ))}
      </div>
    </Sidebar>
  )
}
