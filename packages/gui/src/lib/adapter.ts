import type { Navigation } from './api'
import { getToken } from './auth'

export interface CorpoAdapter {
  getNavigation(): Promise<Navigation>
  getFile(id: string): Promise<string>
  putFile(id: string, raw: string): Promise<void>
}

// ─── LocalAdapter ───────────────────────────────────────────────────────────

async function handleLocalResponse(res: Response): Promise<void> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body.error) message = body.error
    } catch {}
    throw new Error(message)
  }
}

export class LocalAdapter implements CorpoAdapter {
  async getNavigation(): Promise<Navigation> {
    const res = await fetch('/api/navigation')
    await handleLocalResponse(res)
    const data = await res.json()
    return data.navigation as Navigation
  }

  async getFile(id: string): Promise<string> {
    const res = await fetch(`/api/files/${id}`)
    if (res.status === 404) throw new Error(`File not found: ${id}`)
    await handleLocalResponse(res)
    return res.text()
  }

  async putFile(id: string, raw: string): Promise<void> {
    const res = await fetch(`/api/files/${id}/commit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    })
    await handleLocalResponse(res)
  }
}

// ─── GitHubAdapter ──────────────────────────────────────────────────────────

interface GitHubContentsResponse {
  content: string
  sha: string
  encoding: string
}

async function handleGitHubResponse(res: Response): Promise<void> {
  if (!res.ok) {
    let message = `GitHub API HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body.message) message = body.message
    } catch {}
    throw new Error(message)
  }
}

export class GitHubAdapter implements CorpoAdapter {
  private owner: string
  private repo: string
  // Map of path → sha, populated on reads and used on writes to avoid round-trips
  private shaCache: Map<string, string> = new Map()

  constructor(owner: string, repo: string) {
    this.owner = owner
    this.repo = repo
  }

  private get baseUrl(): string {
    return `https://api.github.com/repos/${this.owner}/${this.repo}/contents`
  }

  private buildHeaders(requiresAuth = false): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else if (requiresAuth) {
      throw new Error('Authentication required. Please log in with GitHub.')
    }
    return headers
  }

  private decodeBase64(encoded: string): string {
    // GitHub returns base64 with newlines — strip them before decoding.
    // Use TextDecoder so multi-byte UTF-8 sequences (em dashes, curly quotes, etc.)
    // are decoded correctly. atob() alone gives a Latin-1 binary string which
    // corrupts any character outside ASCII.
    const cleaned = encoded.replace(/\n/g, '')
    const binary = atob(cleaned)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return new TextDecoder('utf-8').decode(bytes)
  }

  private encodeBase64(raw: string): string {
    const bytes = new TextEncoder().encode(raw)
    let binary = ''
    bytes.forEach((b) => (binary += String.fromCharCode(b)))
    return btoa(binary)
  }

  async getNavigation(): Promise<Navigation> {
    const path = '.corpo/config.json'
    const url = `${this.baseUrl}/${path}`
    const res = await fetch(url, { headers: this.buildHeaders() })
    await handleGitHubResponse(res)
    const data = (await res.json()) as GitHubContentsResponse
    this.shaCache.set(path, data.sha)
    const decoded = this.decodeBase64(data.content)
    const config = JSON.parse(decoded)
    return config.navigation as Navigation
  }

  async getFile(id: string): Promise<string> {
    const path = `.corpo/files/${id}.md`
    const url = `${this.baseUrl}/${path}`
    const res = await fetch(url, { headers: this.buildHeaders() })
    if (res.status === 404) throw new Error(`File not found: ${id}`)
    await handleGitHubResponse(res)
    const data = (await res.json()) as GitHubContentsResponse
    this.shaCache.set(path, data.sha)
    return this.decodeBase64(data.content)
  }

  async putFile(id: string, raw: string): Promise<void> {
    const path = `.corpo/files/${id}.md`

    // Ensure we have a SHA — fetch if not cached
    if (!this.shaCache.has(path)) {
      await this.getFile(id)
    }

    const sha = this.shaCache.get(path)
    if (!sha) throw new Error(`Could not determine SHA for ${path}`)

    const url = `${this.baseUrl}/${path}`
    const body = JSON.stringify({
      message: `corpo: update ${id}`,
      content: this.encodeBase64(raw),
      sha,
    })

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        ...this.buildHeaders(true),
        'Content-Type': 'application/json',
      },
      body,
    })

    if (res.status === 409) {
      throw new Error('Conflict: the file was modified by someone else. Please refresh and try again.')
    }

    await handleGitHubResponse(res)

    // Update the cached SHA with the new one from the response
    try {
      const data = await res.json()
      if (data.content?.sha) {
        this.shaCache.set(path, data.content.sha)
      }
    } catch {
      // Not critical — next write will re-fetch if needed
    }
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createAdapter(): CorpoAdapter {
  const owner = import.meta.env.VITE_GITHUB_OWNER as string | undefined
  const repo = import.meta.env.VITE_GITHUB_REPO as string | undefined
  if (owner && repo) {
    return new GitHubAdapter(owner, repo)
  }
  return new LocalAdapter()
}
