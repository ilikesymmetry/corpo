import { readFile, writeFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export async function findRoot(start = process.cwd()): Promise<string> {
  let dir = start
  while (true) {
    try {
      await access(join(dir, '.corpo', 'config.json'))
      return dir
    } catch {
      const parent = dirname(dir)
      if (parent === dir) throw new Error('Not inside a corpo directory')
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

type NavNode = string | { group: string; children: NavNode[] }

// Remove a file ID from anywhere in the navigation tree.
export function navRemove(nodes: NavNode[], id: string): NavNode[] {
  return nodes
    .filter(n => n !== id)
    .map(n =>
      typeof n === 'string' ? n : { ...n, children: navRemove(n.children, id) },
    )
}

// Return true if the ID already exists anywhere in the tree.
export function navContains(nodes: NavNode[], id: string): boolean {
  for (const n of nodes) {
    if (n === id) return true
    if (typeof n !== 'string' && navContains(n.children, id)) return true
  }
  return false
}

// Insert a file ID at the given group path (e.g. ["Product", "Features", "CLI"]).
// Creates groups along the path if they don't exist.
// An empty path inserts at the root level.
export function navInsert(nodes: NavNode[], id: string, groupPath: string[]): NavNode[] {
  if (groupPath.length === 0) {
    return [...nodes, id]
  }
  const [head, ...tail] = groupPath
  const idx = nodes.findIndex(n => typeof n !== 'string' && n.group === head)
  if (idx === -1) {
    // Group doesn't exist — create it
    const newGroup: NavNode = { group: head, children: navInsert([], id, tail) }
    return [...nodes, newGroup]
  }
  const node = nodes[idx] as { group: string; children: NavNode[] }
  return [
    ...nodes.slice(0, idx),
    { ...node, children: navInsert(node.children, id, tail) },
    ...nodes.slice(idx + 1),
  ]
}

// Parse a "/" delimited group path string into an array of labels.
// Empty string → root (empty array).
export function parseGroupPath(path: string): string[] {
  if (!path.trim()) return []
  return path.split('/').map(s => s.trim()).filter(Boolean)
}
