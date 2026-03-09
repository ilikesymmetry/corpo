import { readFile, writeFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export async function findCorpusRoot(start = process.cwd()): Promise<string> {
  let dir = start
  while (true) {
    try {
      await access(join(dir, '.corpo', 'config.json'))
      return dir
    } catch {
      const parent = dirname(dir)
      if (parent === dir) throw new Error('Not inside a Corpo corpus')
      dir = parent
    }
  }
}

export async function readConfig(root: string) {
  const raw = await readFile(join(root, '.corpo', 'config.json'), 'utf8')
  return JSON.parse(raw)
}

export async function writeConfig(root: string, config: unknown) {
  await writeFile(
    join(root, '.corpo', 'config.json'),
    JSON.stringify(config, null, 2),
  )
}
