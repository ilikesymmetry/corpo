import { z } from 'incur'
import { findCorpusRoot } from '../lib/corpus.ts'
import { readCorpoFile, writeCorpoFile } from '../lib/files.ts'
import { parseCorpoFile, serializeCorpoFile } from '../lib/frontmatter.ts'

export const resolve = {
  description: 'Resolve a thread by removing it from frontmatter and body.',
  args: z.object({
    fileId: z.string().describe('File ID (32-char hex)'),
    threadId: z.string().describe('Thread ID (8-char hex)'),
  }),
  async run(c: { args: { fileId: string; threadId: string } }) {
    const root = await findCorpusRoot()
    const raw = await readCorpoFile(root, c.args.fileId)
    if (raw === null) throw new Error(`File not found: ${c.args.fileId}`)

    const { meta, content } = parseCorpoFile(raw)
    if (!meta.threads?.[c.args.threadId]) throw new Error(`Thread not found: ${c.args.threadId}`)

    delete meta.threads![c.args.threadId]
    if (Object.keys(meta.threads!).length === 0) delete meta.threads

    const newContent = content
      .replace(`<!-- thread:${c.args.threadId} -->\n`, '')
      .replace(`<!-- thread:${c.args.threadId} -->`, '')

    await writeCorpoFile(root, c.args.fileId, serializeCorpoFile(meta, newContent))

    return { ok: true, fileId: c.args.fileId, threadId: c.args.threadId }
  },
}
