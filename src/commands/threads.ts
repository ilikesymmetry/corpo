import { z } from 'incur'
import { findCorpusRoot } from '../lib/corpus.ts'
import { readCorpoFile } from '../lib/files.ts'
import { parseCorpoFile } from '../lib/frontmatter.ts'

export const threads = {
  description: 'List all threads in a file.',
  args: z.object({
    fileId: z.string().describe('File ID (32-char hex)'),
  }),
  async run(c: { args: { fileId: string } }) {
    const root = await findCorpusRoot()
    const raw = await readCorpoFile(root, c.args.fileId)
    if (raw === null) throw new Error(`File not found: ${c.args.fileId}`)

    const { meta } = parseCorpoFile(raw)
    const fileThreads = meta.threads ?? {}

    return Object.entries(fileThreads).map(([id, thread]) => {
      const lastAuthor = thread.replies?.at(-1)?.author ?? thread.author
      return {
        id,
        author: thread.author,
        timestamp: thread.timestamp,
        body: thread.body,
        replies: thread.replies ?? [],
        needsResponse: lastAuthor !== 'claude',
      }
    })
  },
}
