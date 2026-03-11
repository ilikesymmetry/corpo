import { z } from 'incur'
import { findRoot } from '../lib/config.ts'
import { readCorpoFile } from '../lib/files.ts'
import { parseCorpoFile } from '../lib/frontmatter.ts'
import { resolveAdapter } from '../lib/remote.ts'

// Fields that belong only to the local clone and must not pollute the source.
const LOCAL_ONLY_FIELDS = new Set(['remote', 'syncedAt', 'checksum'])

export const push = {
  description: 'Push a cloned corpo file back to its source.',
  args: z.object({
    fileId: z.string().describe('File ID (32-char hex) of the cloned corpo file'),
  }),
  async run(c: { args: { fileId: string } }) {
    const root = await findRoot()
    const raw = await readCorpoFile(root, c.args.fileId)
    if (raw === null) throw new Error(`File not found: ${c.args.fileId}`)

    const { meta, content: body } = parseCorpoFile(raw)

    const remoteUri = meta.remote as string | undefined
    if (!remoteUri) {
      throw new Error('Not a cloned file — no remote URI found')
    }

    const adapter = resolveAdapter(remoteUri)

    if (!adapter.write) {
      throw new Error('This remote adapter is read-only')
    }

    if (remoteUri.startsWith('path:')) {
      // Non-corpo target: send body only, no frontmatter, strip thread anchors
      const strippedBody = body.replace(/<!--\s*thread:[0-9a-f]{8}\s*-->\n?/g, '')
      await adapter.write(strippedBody)
    } else {
      // Corpo target (git:): send body + portable frontmatter (strip local-only fields)
      const portableFrontmatter: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(meta)) {
        if (!LOCAL_ONLY_FIELDS.has(key)) {
          portableFrontmatter[key] = value
        }
      }
      await adapter.write(body, portableFrontmatter)
    }

    return {
      id: c.args.fileId,
      remote: remoteUri,
    }
  },
}
