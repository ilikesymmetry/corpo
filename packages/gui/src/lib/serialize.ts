import { dump } from 'js-yaml'
import type { FileMeta } from './parse'

export function generateThreadId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// endLine is the exclusive end-line of the block (from markdown-it's token.map[1]).
// Inserting at that index places the anchor right after the block, before the next one.
export function insertThreadAnchor(content: string, endLine: number, threadId: string): string {
  const anchor = `<!-- thread:${threadId} -->`
  const lines = content.split('\n')
  lines.splice(endLine, 0, anchor)
  return lines.join('\n')
}

export function serializeFile(meta: FileMeta, content: string): string {
  const frontmatter = dump(meta, { lineWidth: -1 })
  return `---\n${frontmatter}---\n${content}`
}
