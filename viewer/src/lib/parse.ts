import { load } from 'js-yaml'

export interface Thread {
  author: string
  timestamp: string
  body: string
  replies?: Array<{ author: string; timestamp: string; body: string }>
}

export interface FileMeta {
  title: string
  description?: string
  sidebarTitle?: string
  threads?: Record<string, Thread>
}

export interface ParsedFile {
  meta: FileMeta
  content: string  // raw markdown body (thread anchors intact)
}

// Returns a map of line number (as string) → thread IDs for headings with attached threads.
// Uses line numbers rather than heading text to avoid issues with typographic quote normalization.
export function parseHeadingThreads(content: string): Record<string, string[]> {
  const lines = content.split('\n')
  const result: Record<string, string[]> = {}
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].match(/^#{1,6}\s+/)) continue
    const ids: string[] = []
    for (let j = i + 1; j < lines.length; j++) {
      const am = lines[j].match(/^<!-- thread:([a-f0-9]+) -->$/)
      if (am) ids.push(am[1])
      else break
    }
    if (ids.length > 0) result[String(i)] = ids
  }
  return result
}

export function parseFile(raw: string): ParsedFile {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: { title: 'Untitled' }, content: raw }
  const meta = load(match[1]) as FileMeta
  const content = match[2]
  return { meta, content }
}
