import { readFile, writeFile, unlink, access, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { generateId } from './id.ts'

function filePath(root: string, id: string) {
  return join(root, '.corpo', 'files', `${id}.md`)
}

export async function readCorpoFile(root: string, id: string): Promise<string | null> {
  try {
    return await readFile(filePath(root, id), 'utf8')
  } catch (e: any) {
    if (e.code === 'ENOENT') return null
    throw e
  }
}

export async function writeCorpoFile(root: string, id: string, raw: string): Promise<void> {
  await writeFile(filePath(root, id), raw)
}

export async function createCorpoFile(root: string, raw: string): Promise<string> {
  const id = generateId()
  await writeFile(filePath(root, id), raw)
  return id
}

export async function deleteCorpoFile(root: string, id: string): Promise<void> {
  await unlink(filePath(root, id))
}

export async function listCorpoFiles(root: string): Promise<string[]> {
  try {
    const entries = await readdir(join(root, '.corpo', 'files'))
    return entries
      .filter(f => /^[a-f0-9]{32}\.md$/.test(f))
      .map(f => f.slice(0, -3))
  } catch {
    return []
  }
}

export async function fileExists(root: string, id: string): Promise<boolean> {
  try {
    await access(filePath(root, id))
    return true
  } catch {
    return false
  }
}
