import type { Thread } from '../lib/parse'

interface Props {
  threads: Record<string, Thread>
}

function formatDate(ts: string) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  } catch { return ts }
}

export function ThreadPanel({ threads }: Props) {
  const entries = Object.entries(threads)
  if (entries.length === 0) return null

  return (
    <aside className="w-72 shrink-0 border-l border-gray-200 dark:border-gray-700 overflow-y-auto py-12 px-4 space-y-6">
      {entries.map(([id, thread]) => (
        <div key={id} className="text-sm">
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
        </div>
      ))}
    </aside>
  )
}
