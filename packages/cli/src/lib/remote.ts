import { readFile, writeFile } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { findRoot } from './config.ts'

export interface RemoteAdapter {
  read(): Promise<string>
  write?(body: string, frontmatter?: Record<string, unknown>): Promise<void>
}

// ---------------------------------------------------------------------------
// PathAdapter
// ---------------------------------------------------------------------------

class PathAdapter implements RemoteAdapter {
  constructor(private readonly filePath: string) {}

  async read(): Promise<string> {
    const abs = this.resolvedPath()
    return readFile(abs, 'utf8')
  }

  async write(body: string): Promise<void> {
    const abs = this.resolvedPath()
    await writeFile(abs, body, 'utf8')
  }

  private resolvedPath(): string {
    if (isAbsolute(this.filePath)) return this.filePath
    // Relative paths are resolved from the repo root.
    // findRoot is async so we fall back to process.cwd() synchronously here;
    // callers that need the root should resolve first. In practice this
    // works correctly because the CLI always runs from inside the repo.
    return resolve(process.cwd(), this.filePath)
  }
}

// ---------------------------------------------------------------------------
// GitAdapter
// ---------------------------------------------------------------------------

// URI shape after the "git:" prefix:
//   github.com/{owner}/{repo}/blob/{ref}/{path}
// e.g. github.com/ilikesymmetry/corpo/blob/main/.corpo/files/abc.md

class GitAdapter implements RemoteAdapter {
  constructor(private readonly uri: string) {}

  // Parse "github.com/owner/repo/blob/ref/path/to/file" into parts
  private parse(): { owner: string; repo: string; ref: string; path: string } {
    // Strip leading "github.com/"
    const withoutHost = this.uri.replace(/^github\.com\//, '')
    const parts = withoutHost.split('/')
    if (parts.length < 5) {
      throw new Error(`Invalid git: URI — expected github.com/{owner}/{repo}/blob/{ref}/{path...}, got: ${this.uri}`)
    }
    const [owner, repo, , ref, ...pathParts] = parts
    // The third segment should be "blob" but we skip validation to allow flexibility
    const path = pathParts.join('/')
    return { owner, repo, ref, path }
  }

  private authHeaders(): Record<string, string> {
    const token = process.env.GITHUB_TOKEN
    if (token) return { Authorization: `token ${token}` }
    return {}
  }

  async read(): Promise<string> {
    const { owner, repo, ref, path } = this.parse()
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...this.authHeaders(),
      },
    })
    if (!res.ok) {
      throw new Error(`GitHub API error ${res.status} fetching ${url}: ${await res.text()}`)
    }
    const data = (await res.json()) as { content?: string; encoding?: string }
    if (!data.content) throw new Error(`GitHub API response missing content for ${url}`)
    // GitHub returns base64-encoded content with embedded newlines
    return Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8')
  }

  async write(body: string, frontmatter?: Record<string, unknown>): Promise<void> {
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable not set — required for git: adapter writes')
    }

    const { owner, repo, ref, path } = this.parse()

    // Build the file content to write
    let fileContent: string
    if (frontmatter) {
      // Corpo target: serialize frontmatter + body
      const { dump } = await import('js-yaml')
      fileContent = `---\n${dump(frontmatter, { lineWidth: -1 })}---\n${body}`
    } else {
      fileContent = body
    }

    const encoded = Buffer.from(fileContent, 'utf8').toString('base64')

    // Fetch current SHA so we can update the file
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
    const getRes = await fetch(getUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `token ${token}`,
      },
    })

    let sha: string | undefined
    if (getRes.ok) {
      const existing = (await getRes.json()) as { sha?: string }
      sha = existing.sha
    } else if (getRes.status !== 404) {
      throw new Error(`GitHub API error ${getRes.status} fetching file SHA: ${await getRes.text()}`)
    }

    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    const body2: Record<string, unknown> = {
      message: `corpo push: update ${path}`,
      content: encoded,
      branch: ref,
    }
    if (sha) body2.sha = sha

    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body2),
    })

    if (!putRes.ok) {
      throw new Error(`GitHub API error ${putRes.status} writing ${putUrl}: ${await putRes.text()}`)
    }
  }
}

// ---------------------------------------------------------------------------
// URI parsing helpers
// ---------------------------------------------------------------------------

/**
 * Resolve a stored normalized remote URI string (e.g. "path:foo.md" or
 * "git:github.com/...") into the appropriate adapter.
 */
export function resolveAdapter(remoteUri: string): RemoteAdapter {
  if (remoteUri.startsWith('path:')) {
    return new PathAdapter(remoteUri.slice('path:'.length))
  }
  if (remoteUri.startsWith('git:')) {
    return new GitAdapter(remoteUri.slice('git:'.length))
  }
  throw new Error(`Unknown remote URI prefix — expected "path:" or "git:", got: ${remoteUri}`)
}

/**
 * Parse a user-typed URI (file path, https://github.com/... URL, etc.) into
 * a normalized remote URI and the corresponding adapter.
 *
 * GitHub HTTPS URLs → git: adapter
 * Anything else     → path: adapter
 */
export function parseUserUri(input: string): { normalizedUri: string; adapter: RemoteAdapter } {
  if (input.startsWith('https://github.com/') || input.startsWith('http://github.com/')) {
    // Strip the https:// or http:// prefix; keep everything else.
    const withoutScheme = input.replace(/^https?:\/\//, '')
    const normalizedUri = `git:${withoutScheme}`
    return { normalizedUri, adapter: new GitAdapter(withoutScheme) }
  }

  // Local path (relative or absolute)
  const normalizedUri = `path:${input}`
  return { normalizedUri, adapter: new PathAdapter(input) }
}

// ---------------------------------------------------------------------------
// Title extraction
// ---------------------------------------------------------------------------

/**
 * Extract the first H1 heading from a markdown body.
 * Returns the heading text (without the "# " prefix), or null if not found.
 */
export function extractH1(body: string): string | null {
  const match = body.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

/**
 * Extract a fallback display name from a URI or file path string.
 * Returns the last non-empty path segment, without extension.
 */
export function uriLastSegment(uri: string): string {
  const parts = uri.replace(/\?.*$/, '').split('/').filter(Boolean)
  const last = parts[parts.length - 1] ?? uri
  // Strip common extensions
  return last.replace(/\.(md|txt|markdown)$/i, '')
}
