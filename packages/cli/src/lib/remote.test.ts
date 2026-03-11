import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createHash } from 'node:crypto'
import { parseUserUri, resolveAdapter, extractH1, uriLastSegment } from './remote.ts'

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

// ---------------------------------------------------------------------------
// parseUserUri
// ---------------------------------------------------------------------------

describe('parseUserUri', () => {
  it('local relative path → path: adapter and normalized URI', () => {
    const { normalizedUri } = parseUserUri('./skills/frd/SKILL.md')
    expect(normalizedUri).toBe('path:./skills/frd/SKILL.md')
  })

  it('local absolute path → path: adapter and normalized URI', () => {
    const { normalizedUri } = parseUserUri('/Users/me/docs/file.md')
    expect(normalizedUri).toBe('path:/Users/me/docs/file.md')
  })

  it('GitHub HTTPS URL → git: adapter with branch preserved', () => {
    const input = 'https://github.com/owner/repo/blob/main/path/to/file.md'
    const { normalizedUri } = parseUserUri(input)
    expect(normalizedUri).toBe('git:github.com/owner/repo/blob/main/path/to/file.md')
  })

  it('GitHub HTTP URL (rare) → git: adapter', () => {
    const input = 'http://github.com/owner/repo/blob/develop/README.md'
    const { normalizedUri } = parseUserUri(input)
    expect(normalizedUri).toBe('git:github.com/owner/repo/blob/develop/README.md')
  })

  it('relative path without ./ → path: adapter', () => {
    const { normalizedUri } = parseUserUri('docs/notes.md')
    expect(normalizedUri).toBe('path:docs/notes.md')
  })
})

// ---------------------------------------------------------------------------
// resolveAdapter
// ---------------------------------------------------------------------------

describe('resolveAdapter', () => {
  it('path: prefix → PathAdapter (has read and write)', () => {
    const adapter = resolveAdapter('path:foo.md')
    expect(typeof adapter.read).toBe('function')
    expect(typeof adapter.write).toBe('function')
  })

  it('git: prefix → GitAdapter (has read and write)', () => {
    const adapter = resolveAdapter('git:github.com/owner/repo/blob/main/file.md')
    expect(typeof adapter.read).toBe('function')
    expect(typeof adapter.write).toBe('function')
  })

  it('unknown prefix → throws', () => {
    expect(() => resolveAdapter('s3:bucket/key')).toThrow('Unknown remote URI prefix')
  })
})

// ---------------------------------------------------------------------------
// PathAdapter.read() — integration with real temp files
// ---------------------------------------------------------------------------

describe('PathAdapter.read()', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'corpo-remote-test-'))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('reads file contents from an absolute path', async () => {
    const filePath = join(dir, 'test.md')
    await writeFile(filePath, '# Hello\n\nWorld', 'utf8')

    const adapter = resolveAdapter(`path:${filePath}`)
    const content = await adapter.read()
    expect(content).toBe('# Hello\n\nWorld')
  })

  it('throws when file does not exist', async () => {
    const adapter = resolveAdapter(`path:${join(dir, 'nonexistent.md')}`)
    await expect(adapter.read()).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// PathAdapter.write() — integration with real temp files
// ---------------------------------------------------------------------------

describe('PathAdapter.write()', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'corpo-remote-write-test-'))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('writes body to the file', async () => {
    const filePath = join(dir, 'output.md')
    await writeFile(filePath, 'original content', 'utf8')

    const adapter = resolveAdapter(`path:${filePath}`)
    await adapter.write!('updated content')

    const result = await readFile(filePath, 'utf8')
    expect(result).toBe('updated content')
  })
})

// ---------------------------------------------------------------------------
// Checksum determinism
// ---------------------------------------------------------------------------

describe('sha256 checksum', () => {
  it('is deterministic for the same input', () => {
    const content = '# My File\n\nSome content here.'
    expect(sha256(content)).toBe(sha256(content))
  })

  it('differs for different inputs', () => {
    expect(sha256('hello')).not.toBe(sha256('world'))
  })

  it('produces a 64-char hex string', () => {
    const hash = sha256('test content')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})

// ---------------------------------------------------------------------------
// extractH1 / uriLastSegment
// ---------------------------------------------------------------------------

describe('extractH1', () => {
  it('returns the H1 text without the # prefix', () => {
    expect(extractH1('# My Title\n\nBody')).toBe('My Title')
  })

  it('returns null when no H1 found', () => {
    expect(extractH1('## Sub heading\n\nNo H1 here')).toBeNull()
  })

  it('returns the first H1 if multiple exist', () => {
    expect(extractH1('# First\n\n# Second')).toBe('First')
  })

  it('handles H1 with extra spaces after #', () => {
    expect(extractH1('#  Spaced Title')).toBe('Spaced Title')
  })
})

describe('uriLastSegment', () => {
  it('returns filename without .md extension', () => {
    expect(uriLastSegment('path:./docs/notes.md')).toBe('notes')
  })

  it('handles GitHub-style URIs', () => {
    expect(uriLastSegment('git:github.com/owner/repo/blob/main/file.md')).toBe('file')
  })

  it('strips query strings before extracting segment', () => {
    expect(uriLastSegment('https://example.com/file.md?ref=main')).toBe('file')
  })
})
