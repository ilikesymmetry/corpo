import { z } from 'incur'
import { findRoot } from '../lib/config.ts'
import { readCorpoFile, listCorpoFiles } from '../lib/files.ts'
import { parseCorpoFile } from '../lib/frontmatter.ts'

export const lint = {
  description: 'Check corpo files for thread anchor integrity.',
  args: z.object({
    fileId: z.string().describe('File ID to lint (omit to lint all files)').optional(),
  }),
  async run(c: { args: { fileId?: string } }) {
    const root = await findRoot()
    const ids = c.args.fileId ? [c.args.fileId] : await listCorpoFiles(root)

    const errors: Array<{ fileId: string; rule: string; detail: string }> = []

    for (const id of ids) {
      const raw = await readCorpoFile(root, id)
      if (!raw) continue
      const { meta, content } = parseCorpoFile(raw)

      const threadIds = new Set(Object.keys(meta.threads ?? {}))
      // Strip fenced code blocks so example anchors don't produce false positives
      const bareContent = content.replace(/```[\s\S]*?```/g, '')
      const anchorIds = new Set(
        [...bareContent.matchAll(/<!-- thread:([a-f0-9]+) -->/g)].map(m => m[1])
      )

      for (const tid of threadIds) {
        if (!anchorIds.has(tid)) {
          errors.push({ fileId: id, rule: 'orphaned-thread', detail: `thread ${tid} in frontmatter has no anchor in body` })
        }
      }
      for (const tid of anchorIds) {
        if (!threadIds.has(tid)) {
          errors.push({ fileId: id, rule: 'dangling-anchor', detail: `anchor ${tid} in body has no thread in frontmatter` })
        }
      }
    }

    if (errors.length > 0) {
      for (const e of errors) {
        console.error(`${e.fileId}: [${e.rule}] ${e.detail}`)
      }
      process.exit(1)
    }

    return { ok: true, checked: ids.length }
  },
}
