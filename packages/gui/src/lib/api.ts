import { createAdapter } from './adapter'

export type Node = string | { group: string; children: Node[] }
export type Navigation = Node[]

const adapter = createAdapter()

// ─── Adapter-backed operations (work in both local and GitHub Pages mode) ─────

export async function getNavigation(): Promise<Navigation> {
  return adapter.getNavigation()
}

export async function getFile(id: string): Promise<string> {
  return adapter.getFile(id)
}

export async function commitFile(id: string, raw: string): Promise<void> {
  return adapter.putFile(id, raw)
}

// ─── Local-server-only operations (CLI mode, not available on GitHub Pages) ──

async function handleResponse(res: Response): Promise<void> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body.error) message = body.error
    } catch {}
    throw new Error(message)
  }
}

export async function putNavigation(navigation: Navigation): Promise<void> {
  const res = await fetch('/api/navigation', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ navigation }),
  })
  await handleResponse(res)
}

export async function createFile(raw: string): Promise<{ id: string }> {
  const res = await fetch('/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  })
  await handleResponse(res)
  return res.json()
}

export async function deleteFile(id: string): Promise<void> {
  const res = await fetch(`/api/files/${id}`, {
    method: 'DELETE',
  })
  await handleResponse(res)
}

export async function resolveThread(fileId: string, threadId: string): Promise<void> {
  const res = await fetch(`/api/files/${fileId}/threads/${threadId}`, {
    method: 'DELETE',
  })
  await handleResponse(res)
}
