import { describe, it, expect } from 'bun:test'
import { insertThreadAnchor, serializeFile } from './serialize'

const CONTENT = `## What We're Building

Corpo has five components.

| Phase | Component | Status |
|---|---|---|
| 1 | Protocol v1.0 | in-progress |
`

describe('insertThreadAnchor', () => {
  it('inserts after line 1 (end of heading block)', () => {
    const result = insertThreadAnchor(CONTENT, 1, 'abc12345')
    const lines = result.split('\n')
    expect(lines[0]).toBe("## What We're Building")
    expect(lines[1]).toBe('<!-- thread:abc12345 -->')
  })

  it('inserts after line 3 (end of paragraph block)', () => {
    const result = insertThreadAnchor(CONTENT, 3, 'abc12345')
    const lines = result.split('\n')
    expect(lines[2]).toBe('Corpo has five components.')
    expect(lines[3]).toBe('<!-- thread:abc12345 -->')
  })

  it('inserts after line 7 (end of table block, before trailing blank)', () => {
    // Table occupies lines 4-6; markdown-it sets endLine=7 (blank line after table)
    const result = insertThreadAnchor(CONTENT, 7, 'abc12345')
    const lines = result.split('\n')
    expect(lines[6]).toBe('| 1 | Protocol v1.0 | in-progress |')
    expect(lines[7]).toBe('<!-- thread:abc12345 -->')
  })
})

describe('serializeFile', () => {
  it('round-trips frontmatter and body', () => {
    const meta = { title: 'Test', description: 'A test file' }
    const content = 'Hello world\n'
    const raw = serializeFile(meta, content)
    expect(raw).toMatch(/^---\n/)
    expect(raw).toContain('title: Test')
    expect(raw).toContain('Hello world')
  })
})
