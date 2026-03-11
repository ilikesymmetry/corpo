import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { mkdtemp, writeFile, readFile, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { parseCorpoFile } from '../lib/frontmatter.ts'
import { listCorpoFiles, readCorpoFile } from '../lib/files.ts'

// ---------------------------------------------------------------------------
// Helper: create a minimal corpo repo in a temp directory
// ---------------------------------------------------------------------------

async function makeCorpoRepo(dir: string): Promise<void> {
  await mkdir(join(dir, '.corpo', 'files'), { recursive: true })
  await writeFile(
    join(dir, '.corpo', 'config.json'),
    JSON.stringify({ navigation: [] }),
    'utf8',
  )
}

// ---------------------------------------------------------------------------
// Helper: run commands against a specific working directory.
// We do this by temporarily overriding process.cwd and then restoring it.
// ---------------------------------------------------------------------------

async function withCwd<T>(dir: string, fn: () => Promise<T>): Promise<T> {
  const original = process.cwd()
  process.chdir(dir)
  try {
    return await fn()
  } finally {
    process.chdir(original)
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('clone', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'corpo-clone-test-'))
    await makeCorpoRepo(dir)
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('clones a local file and creates a corpo file with correct remote field', async () => {
    const sourceContent = '# My Source\n\nHello world.'
    const sourcePath = join(dir, 'source.md')
    await writeFile(sourcePath, sourceContent, 'utf8')

    const { clone } = await import('./clone.ts')
    const result = await withCwd(dir, () =>
      clone.run({ args: { uri: sourcePath }, options: {} }),
    )

    expect(result.id).toMatch(/^[a-f0-9]{32}$/)
    expect(result.remote).toBe(`path:${sourcePath}`)
    expect(result.syncedAt).toBeTruthy()
    expect(result.group).toBeUndefined()

    // Verify the created corpo file on disk
    const raw = await readCorpoFile(dir, result.id)
    expect(raw).not.toBeNull()
    const { meta, content } = parseCorpoFile(raw!)
    expect(meta.title).toBe('My Source')
    expect(meta.remote).toBe(`path:${sourcePath}`)
    expect(meta.syncedAt).toBe(result.syncedAt)
    expect(typeof meta.checksum).toBe('string')
    expect((meta.checksum as string).length).toBe(64)
    expect(content).toBe(sourceContent)
  })

  it('uses --title override instead of H1', async () => {
    const sourcePath = join(dir, 'source.md')
    await writeFile(sourcePath, '# Original Title\n\nContent.', 'utf8')

    const { clone } = await import('./clone.ts')
    const result = await withCwd(dir, () =>
      clone.run({ args: { uri: sourcePath }, options: { title: 'My Custom Title' } }),
    )

    const raw = await readCorpoFile(dir, result.id)
    const { meta } = parseCorpoFile(raw!)
    expect(meta.title).toBe('My Custom Title')
  })

  it('falls back to filename when no H1 is present', async () => {
    const sourcePath = join(dir, 'readme-doc.md')
    await writeFile(sourcePath, 'Just a paragraph, no heading.', 'utf8')

    const { clone } = await import('./clone.ts')
    const result = await withCwd(dir, () =>
      clone.run({ args: { uri: sourcePath }, options: {} }),
    )

    const raw = await readCorpoFile(dir, result.id)
    const { meta } = parseCorpoFile(raw!)
    // Should fall back to filename-without-extension
    expect(meta.title).toBe('readme-doc')
  })

  it('creates exactly one corpo file', async () => {
    const sourcePath = join(dir, 'source.md')
    await writeFile(sourcePath, '# Test\n\nContent.', 'utf8')

    const before = await listCorpoFiles(dir)

    const { clone } = await import('./clone.ts')
    await withCwd(dir, () =>
      clone.run({ args: { uri: sourcePath }, options: {} }),
    )

    const after = await listCorpoFiles(dir)
    expect(after.length).toBe(before.length + 1)
  })

  it('inserts into navigation when --group is provided', async () => {
    const sourcePath = join(dir, 'source.md')
    await writeFile(sourcePath, '# Source\n\nContent.', 'utf8')

    const { clone } = await import('./clone.ts')
    const result = await withCwd(dir, () =>
      clone.run({ args: { uri: sourcePath }, options: { group: 'Docs/CLI' } }),
    )

    expect(result.group).toBe('Docs/CLI')

    const configRaw = await readFile(join(dir, '.corpo', 'config.json'), 'utf8')
    const config = JSON.parse(configRaw)
    // Navigation should contain the new id somewhere
    const flat = JSON.stringify(config.navigation)
    expect(flat).toContain(result.id)
  })
})

// ---------------------------------------------------------------------------
// pull
// ---------------------------------------------------------------------------

describe('pull', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'corpo-pull-test-'))
    await makeCorpoRepo(dir)
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('updates the body from the source and refreshes sync metadata', async () => {
    // Set up source file
    const sourcePath = join(dir, 'source.md')
    await writeFile(sourcePath, '# Initial\n\nOriginal content.', 'utf8')

    // Clone it
    const { clone } = await import('./clone.ts')
    const cloneResult = await withCwd(dir, () =>
      clone.run({ args: { uri: sourcePath }, options: {} }),
    )

    // Update the source
    await writeFile(sourcePath, '# Updated\n\nNew content.', 'utf8')

    // Wait a tick so syncedAt timestamps differ
    await new Promise(r => setTimeout(r, 5))

    // Pull
    const { pull } = await import('./pull.ts')
    const pullResult = await withCwd(dir, () =>
      pull.run({ args: { fileId: cloneResult.id } }),
    )

    expect(pullResult.id).toBe(cloneResult.id)
    expect(pullResult.remote).toBe(`path:${sourcePath}`)

    // Verify the file has new body but preserved remote
    const raw = await readCorpoFile(dir, cloneResult.id)
    const { meta, content } = parseCorpoFile(raw!)
    expect(content).toBe('# Updated\n\nNew content.')
    expect(meta.title).toBe('Initial') // frontmatter title is preserved
    expect(meta.remote).toBe(`path:${sourcePath}`)
    expect(meta.syncedAt).toBe(pullResult.syncedAt)
  })

  it('preserves threads on pull', async () => {
    const sourcePath = join(dir, 'source.md')
    await writeFile(sourcePath, '# Doc\n\n<!-- thread:abc12345 -->\nParagraph.', 'utf8')

    // Manually create a corpo file with a thread
    const corpoRaw = `---
title: Doc
description: Test doc
remote: "path:${sourcePath}"
syncedAt: "2025-01-01T00:00:00.000Z"
checksum: abc123
threads:
  abc12345:
    author: me
    timestamp: '2025-01-01T00:00:00.000Z'
    body: A comment
---
# Doc

<!-- thread:abc12345 -->
Paragraph.
`
    const { createCorpoFile } = await import('../lib/files.ts')
    const id = await withCwd(dir, async () => {
      // We need to write the raw file ourselves with a known id for this test
      const generatedId = await createCorpoFile(dir, corpoRaw)
      return generatedId
    })

    // Update source
    await writeFile(sourcePath, '# Doc\n\nUpdated paragraph.', 'utf8')

    // Pull
    const { pull } = await import('./pull.ts')
    const pullResult = await withCwd(dir, () =>
      pull.run({ args: { fileId: id } }),
    )

    const raw = await readCorpoFile(dir, id)
    const { meta, content } = parseCorpoFile(raw!)

    // Thread should still be in frontmatter
    expect(meta.threads?.['abc12345']).toBeTruthy()
    // Body is updated
    expect(content).toContain('Updated paragraph.')
    // Remote preserved
    expect(meta.remote).toBe(`path:${sourcePath}`)
    expect(pullResult.id).toBe(id)
  })

  it('throws when file has no remote field', async () => {
    const corpoRaw = `---
title: No Remote
description: A file without a remote
---
# No Remote

Some content.
`
    const { createCorpoFile } = await import('../lib/files.ts')
    const id = await createCorpoFile(dir, corpoRaw)

    const { pull } = await import('./pull.ts')
    await expect(
      withCwd(dir, () => pull.run({ args: { fileId: id } }))
    ).rejects.toThrow('Not a cloned file — no remote URI found')
  })
})

// ---------------------------------------------------------------------------
// push
// ---------------------------------------------------------------------------

describe('push', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'corpo-push-test-'))
    await makeCorpoRepo(dir)
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('writes body back to the source file (path: target, no frontmatter)', async () => {
    const sourcePath = join(dir, 'source.md')
    await writeFile(sourcePath, '# Original\n\nOriginal content.', 'utf8')

    // Clone
    const { clone } = await import('./clone.ts')
    const cloneResult = await withCwd(dir, () =>
      clone.run({ args: { uri: sourcePath }, options: {} }),
    )

    // Modify the corpo file body directly
    const raw = await readCorpoFile(dir, cloneResult.id)
    const { meta, content: _oldContent } = parseCorpoFile(raw!)
    const { serializeCorpoFile } = await import('../lib/frontmatter.ts')
    const { writeCorpoFile } = await import('../lib/files.ts')
    const newBody = '# Original\n\nModified by corpo edit.'
    await writeCorpoFile(dir, cloneResult.id, serializeCorpoFile(meta, newBody))

    // Push
    const { push } = await import('./push.ts')
    const pushResult = await withCwd(dir, () =>
      push.run({ args: { fileId: cloneResult.id } }),
    )

    expect(pushResult.id).toBe(cloneResult.id)
    expect(pushResult.remote).toBe(`path:${sourcePath}`)

    // Source file should now contain only the body (no frontmatter)
    const sourceAfter = await readFile(sourcePath, 'utf8')
    expect(sourceAfter).toBe(newBody)
    // No frontmatter leaked into the source
    expect(sourceAfter).not.toContain('---')
    expect(sourceAfter).not.toContain('remote:')
  })

  it('throws when file has no remote field', async () => {
    const corpoRaw = `---
title: No Remote
description: A file without a remote
---
Content.
`
    const { createCorpoFile } = await import('../lib/files.ts')
    const id = await createCorpoFile(dir, corpoRaw)

    const { push } = await import('./push.ts')
    await expect(
      withCwd(dir, () => push.run({ args: { fileId: id } }))
    ).rejects.toThrow('Not a cloned file — no remote URI found')
  })
})
