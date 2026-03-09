import { z } from 'incur'
import { findCorpusRoot } from '../lib/corpus.ts'
import { readCorpoFile, writeCorpoFile } from '../lib/files.ts'
import { parseCorpoFile, serializeCorpoFile } from '../lib/frontmatter.ts'

export const reply = {
  description: 'Reply to an existing thread in a file.',
  args: z.object({
    fileId: z.string().describe('File ID (32-char hex)'),
    threadId: z.string().describe('Thread ID (8-char hex)'),
    body: z.string().describe('Reply body'),
  }),
  async run(c: { args: { fileId: string; threadId: string; body: string } }) {
    const root = await findCorpusRoot()
    const raw = await readCorpoFile(root, c.args.fileId)
    if (raw === null) throw new Error(`File not found: ${c.args.fileId}`)

    const { meta, content } = parseCorpoFile(raw)

    const thread = meta.threads?.[c.args.threadId]
    if (!thread) throw new Error(`Thread not found: ${c.args.threadId}`)

    const newReply = {
      author: 'claude',
      timestamp: new Date().toISOString(),
      body: c.args.body,
    }

    thread.replies = [...(thread.replies ?? []), newReply]

    await writeCorpoFile(root, c.args.fileId, serializeCorpoFile(meta, content))

    return { fileId: c.args.fileId, threadId: c.args.threadId, reply: newReply }
  },
}
