import { z } from 'incur'
import { findRoot } from '../lib/config.ts'
import { createCorpoFile } from '../lib/files.ts'
import { join } from 'node:path'

export const newFile = {
  description: 'Create a new corpo file with title and description.',
  args: z.object({
    title: z.string().describe('File title'),
    description: z.string().describe('File description (max 1024 chars)'),
  }),
  async run(c: { args: { title: string; description: string } }) {
    const root = await findRoot()
    const raw = `---\ntitle: ${JSON.stringify(c.args.title)}\ndescription: ${JSON.stringify(c.args.description)}\n---\n`
    const id = await createCorpoFile(root, raw)
    return { id, path: join('.corpo', 'files', `${id}.md`) }
  },
}
