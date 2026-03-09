import { z } from 'incur'
import {
  findRoot,
  readConfig,
  writeConfig,
  navRemove,
  navContains,
  navInsert,
  parseGroupPath,
} from '../lib/config.ts'
import { fileExists } from '../lib/files.ts'

export const mv = {
  description: 'Move a file to a different navigation group.',
  args: z.object({
    id: z.string().describe('File ID (32-char hex)'),
    group: z.string().describe(
      'Target group path (e.g. "Product/Features/CLI"). Use "" or "/" to move to the root navigation level.',
    ),
  }),
  async run(c: { args: { id: string; group: string } }) {
    const { id, group } = c.args
    const root = await findRoot()

    if (!(await fileExists(root, id))) {
      throw new Error(`File not found: ${id}`)
    }

    const groupPath = parseGroupPath(group)
    const config = await readConfig(root)

    if (navContains(config.navigation, id)) {
      // Check if already at the target location by removing and re-checking position.
      // Simple approach: remove then re-insert; if navigation is unchanged, it was a no-op.
      const after = navInsert(navRemove(config.navigation, id), id, groupPath)
      const before = JSON.stringify(config.navigation)
      const afterStr = JSON.stringify(after)
      if (before === afterStr) {
        return { id, group: groupPath.length > 0 ? groupPath.join('/') : '(root)', moved: false, message: 'Already in that group.' }
      }
      config.navigation = after
    } else {
      config.navigation = navInsert(config.navigation, id, groupPath)
    }

    await writeConfig(root, config)
    return { id, group: groupPath.length > 0 ? groupPath.join('/') : '(root)', moved: true }
  },
}
