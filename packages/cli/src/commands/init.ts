import { mkdir, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'

export const init = {
  description: 'Initialize a new corpo directory in the current directory.',
  async run() {
    const cwd = process.cwd()
    const configPath = join(cwd, '.corpo', 'config.json')

    try {
      await access(configPath)
      throw new Error('Already initialized (.corpo/config.json exists)')
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e
    }

    await mkdir(join(cwd, '.corpo', 'files'), { recursive: true })
    await writeFile(configPath, JSON.stringify({ navigation: [] }, null, 2))

    return { initialized: true, root: cwd }
  },
}
