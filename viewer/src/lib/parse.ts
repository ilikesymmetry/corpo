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

export function parseFile(raw: string): ParsedFile {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: { title: 'Untitled' }, content: raw }
  const meta = load(match[1]) as FileMeta
  const content = match[2]
  return { meta, content }
}
