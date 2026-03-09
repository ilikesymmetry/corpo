import { load, dump } from 'js-yaml'

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
  [key: string]: unknown
}

export interface CorpoFile {
  meta: FileMeta
  content: string
}

export function parseCorpoFile(raw: string): CorpoFile {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: { title: 'Untitled' }, content: raw }
  return {
    meta: load(match[1]) as FileMeta,
    content: match[2],
  }
}

export function serializeCorpoFile(meta: FileMeta, content: string): string {
  return `---\n${dump(meta, { lineWidth: -1 })}---\n${content}`
}
