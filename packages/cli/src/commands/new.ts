import { z } from 'incur'
import { findRoot, readConfig, writeConfig, navInsert, parseGroupPath } from '../lib/config.ts'
import { createCorpoFile } from '../lib/files.ts'
import { join } from 'node:path'

export const newFile = {
  description: 'Create a new corpo file with title and description.',
  args: z.object({
    title: z.string().describe('File title'),
    description: z.string().describe('File description (max 1024 chars)'),
  }),
  options: z.object({
    group: z.string().optional().describe(
      'Navigation group path to place the file in (e.g. "Product/Features/CLI"). Creates groups that don\'t exist. Omit to skip navigation placement.',
    ),
  }),
  async run(c: { args: { title: string; description: string }; options: { group?: string } }) {
    const root = await findRoot()
    const raw = `---\ntitle: ${JSON.stringify(c.args.title)}\ndescription: ${JSON.stringify(c.args.description)}\n---\n`
    const id = await createCorpoFile(root, raw)

    let group: string | undefined
    if (c.options.group !== undefined) {
      const groupPath = parseGroupPath(c.options.group)
      const config = await readConfig(root)
      config.navigation = navInsert(config.navigation, id, groupPath)
      await writeConfig(root, config)
      group = groupPath.length > 0 ? groupPath.join('/') : '(root)'
    }

    return { id, path: join('.corpo', 'files', `${id}.md`), group }
  },
}
