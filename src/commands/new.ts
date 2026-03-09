import { z } from 'incur'
import { findCorpusRoot } from '../lib/corpus.ts'
import { createCorpoFile } from '../lib/files.ts'
import { join } from 'node:path'

export const newFile = {
  description: 'Create a new corpus file with title and description.',
  args: z.object({
    title: z.string().describe('File title'),
    description: z.string().describe('File description (max 1024 chars)'),
  }),
  async run(c: { args: { title: string; description: string } }) {
    const root = await findCorpusRoot()
    const raw = `---\ntitle: ${JSON.stringify(c.args.title)}\ndescription: ${JSON.stringify(c.args.description)}\n---\n`
    const id = await createCorpoFile(root, raw)
    return { id, path: join('.corpo', 'files', `${id}.md`) }
  },
}
