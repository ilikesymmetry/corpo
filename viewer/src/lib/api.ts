export type Node = string | { group: string; children: Node[] }
export type Navigation = Node[]

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

export async function getNavigation(): Promise<Navigation> {
  const res = await fetch('/api/navigation')
  await handleResponse(res)
  const data = await res.json()
  return data.navigation as Navigation
}

export async function getFile(id: string): Promise<string> {
  const res = await fetch(`/api/files/${id}`)
  if (res.status === 404) throw new Error(`File not found: ${id}`)
  await handleResponse(res)
  return res.text()
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

export async function commitFile(id: string, raw: string): Promise<void> {
  const res = await fetch(`/api/files/${id}/commit`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  })
  await handleResponse(res)
}

export async function deleteFile(id: string): Promise<void> {
  const res = await fetch(`/api/files/${id}`, {
    method: 'DELETE',
  })
  await handleResponse(res)
}
