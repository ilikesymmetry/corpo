import { z } from 'incur'
import { randomBytes } from 'node:crypto'
import { findRoot } from '../lib/config.ts'
import { readCorpoFile, writeCorpoFile } from '../lib/files.ts'
import { parseCorpoFile, serializeCorpoFile } from '../lib/frontmatter.ts'

function generateThreadId(): string {
  return randomBytes(4).toString('hex')
}

function lintCheck(meta: import('../lib/frontmatter.ts').FileMeta, content: string): string[] {
  const errors: string[] = []
  const threadIds = new Set(Object.keys(meta.threads ?? {}))
  const bareContent = content.replace(/```[\s\S]*?```/g, '')
  const anchorIds = new Set(
    [...bareContent.matchAll(/<!-- thread:([a-f0-9]+) -->/g)].map(m => m[1])
  )

  for (const tid of threadIds) {
    if (!anchorIds.has(tid)) {
      errors.push(`orphaned-thread: thread ${tid} in frontmatter has no anchor in body`)
    }
  }
  for (const tid of anchorIds) {
    if (!threadIds.has(tid)) {
      errors.push(`dangling-anchor: anchor ${tid} in body has no thread in frontmatter`)
    }
  }
  return errors
}

export const comment = {
  description: 'Add a new thread comment to a file at a specific line.',
  args: z.object({
    fileId: z.string().describe('File ID (32-char hex)'),
    line: z.coerce.number().int().min(1).describe('1-based line number; anchor is inserted after this line'),
    body: z.string().describe('Comment text'),
  }),
  async run(c: { args: { fileId: string; line: number; body: string } }) {
    const root = await findRoot()
    const raw = await readCorpoFile(root, c.args.fileId)
    if (raw === null) throw new Error(`File not found: ${c.args.fileId}`)

    const { meta, content } = parseCorpoFile(raw)

    // Collect existing thread IDs for collision checking
    const existingIds = new Set(Object.keys(meta.threads ?? {}))

    // Generate a unique 8-char hex thread ID
    let threadId: string
    do {
      threadId = generateThreadId()
    } while (existingIds.has(threadId))

    // Split content into lines, insert anchor after line `line` (1-based)
    const lines = content.split('\n')
    const insertAfter = c.args.line // 1-based, so index = line - 1, insert after = line
    if (insertAfter > lines.length) {
      throw new Error(`Line ${c.args.line} is out of range (file has ${lines.length} lines)`)
    }

    lines.splice(insertAfter, 0, `<!-- thread:${threadId} -->`)
    const newContent = lines.join('\n')

    // Add thread to frontmatter
    const newThread = {
      author: 'claude',
      timestamp: new Date().toISOString(),
      body: c.args.body,
    }

    const newMeta = {
      ...meta,
      threads: {
        ...(meta.threads ?? {}),
        [threadId]: newThread,
      },
    }

    // Lint check before writing
    const lintErrors = lintCheck(newMeta, newContent)
    if (lintErrors.length > 0) {
      throw new Error(`Lint validation failed:\n${lintErrors.join('\n')}`)
    }

    await writeCorpoFile(root, c.args.fileId, serializeCorpoFile(newMeta, newContent))

    console.log(threadId)

    return { fileId: c.args.fileId, threadId, thread: newThread }
  },
}
