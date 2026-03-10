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

// Returns a map of anchor line number (as string) → thread IDs for all blocks with attached threads.
// Key is the line number of the first thread anchor, which equals the block's data-line-end in the
// rendered DOM (since anchors are inserted at token.map[1], the exclusive end of the block).
export function parseBlockThreads(content: string): Record<string, string[]> {
  const lines = content.split('\n')
  const result: Record<string, string[]> = {}
  let i = 0
  while (i < lines.length) {
    const am = lines[i].match(/^<!-- thread:([a-f0-9]+) -->$/)
    if (!am) { i++; continue }
    const firstLine = i
    const ids: string[] = [am[1]]
    i++
    while (i < lines.length) {
      const next = lines[i].match(/^<!-- thread:([a-f0-9]+) -->$/)
      if (!next) break
      ids.push(next[1])
      i++
    }
    result[String(firstLine)] = ids
  }
  return result
}

export interface Heading {
  level: number
  text: string
  line: number
}

export function parseHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)$/)
    if (match) headings.push({ level: match[1].length, text: match[2].trim(), line: i })
  }
  return headings
}

export function parseFile(raw: string): ParsedFile {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: { title: 'Untitled' }, content: raw }
  const meta = load(match[1]) as FileMeta
  const content = match[2]
  return { meta, content }
}
