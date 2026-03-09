import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { readConfig, writeConfig } from '../lib/corpus.ts'
import { readCorpoFile, writeCorpoFile, fileExists } from '../lib/files.ts'
import { generateId } from '../lib/id.ts'

type Node = string | { group: string; children: Node[] }

function removeFromNavigation(nodes: Node[], id: string): Node[] {
  return nodes
    .filter(node => node !== id)
    .map(node => {
      if (typeof node === 'string') return node
      return { ...node, children: removeFromNavigation(node.children, id) }
    })
}

export class LocalAdapter {
  constructor(private root: string) {}

  async getNavigation(): Promise<Node[]> {
    const config = await readConfig(this.root)
    return config.navigation
  }

  async putNavigation(navigation: Node[]): Promise<void> {
    const config = await readConfig(this.root)
    await writeConfig(this.root, { ...config, navigation })
  }

  async getFile(id: string): Promise<string | null> {
    return readCorpoFile(this.root, id)
  }

  async createFile(raw: string): Promise<string> {
    const id = generateId()
    await writeCorpoFile(this.root, id, raw)
    return id
  }

  async commitFile(id: string, raw: string): Promise<void> {
    if (!await fileExists(this.root, id)) {
      throw Object.assign(new Error('File not found'), { code: 'NOT_FOUND' })
    }
    await writeCorpoFile(this.root, id, raw)
  }

  async deleteFile(id: string): Promise<void> {
    const config = await readConfig(this.root)
    let found = false

    // Local file
    try {
      await unlink(join(this.root, '.corpo', 'files', `${id}.md`))
      found = true
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e
    }

    // Remote file entry
    if (config.remote_files?.[id]) {
      delete config.remote_files[id]
      found = true
    }

    if (!found) throw Object.assign(new Error('File not found'), { code: 'NOT_FOUND' })

    // Strip ID from navigation and persist
    config.navigation = removeFromNavigation(config.navigation ?? [], id)
    await writeConfig(this.root, config)
  }
}
