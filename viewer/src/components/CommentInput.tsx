import { useRef, useEffect, useState } from 'react'

interface Props {
  rect: DOMRect
  onSubmit: (text: string) => void
  onCancel: () => void
}

export function CommentInput({ rect, onSubmit, onCancel }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { ref.current?.focus() }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim()) onSubmit(text.trim())
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  // Clamp left so the popover doesn't go off-screen
  const left = Math.min(rect.left, window.innerWidth - 336)

  return (
    <div
      data-comment-input
      style={{ position: 'fixed', top: rect.bottom + 8, left: Math.max(8, left) }}
      className="z-50 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3"
      onMouseDown={e => e.stopPropagation()}
    >
      <textarea
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add comment… (Enter to save, Shift+Enter for newline)"
        className="w-full resize-none text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        rows={3}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1"
        >
          Cancel
        </button>
        <button
          onClick={() => text.trim() && onSubmit(text.trim())}
          disabled={!text.trim()}
          className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-40"
        >
          Comment
        </button>
      </div>
    </div>
  )
}
