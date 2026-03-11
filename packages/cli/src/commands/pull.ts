import { z } from 'incur'
import { createHash } from 'node:crypto'
import { findRoot } from '../lib/config.ts'
import { readCorpoFile, writeCorpoFile } from '../lib/files.ts'
import { parseCorpoFile, serializeCorpoFile } from '../lib/frontmatter.ts'
import { resolveAdapter } from '../lib/remote.ts'

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

export const pull = {
  description: 'Re-sync the body of a cloned corpo file from its source.',
  args: z.object({
    fileId: z.string().describe('File ID (32-char hex) of the cloned corpo file'),
  }),
  async run(c: { args: { fileId: string } }) {
    const root = await findRoot()
    const raw = await readCorpoFile(root, c.args.fileId)
    if (raw === null) throw new Error(`File not found: ${c.args.fileId}`)

    const { meta, content: _oldContent } = parseCorpoFile(raw)

    const remoteUri = meta.remote as string | undefined
    if (!remoteUri) {
      throw new Error('Not a cloned file — no remote URI found')
    }

    const adapter = resolveAdapter(remoteUri)
    const newBody = await adapter.read()

    const syncedAt = new Date().toISOString()
    const checksum = sha256(newBody)

    // Update only the sync metadata; preserve all other frontmatter (including threads)
    const updatedMeta = { ...meta, syncedAt, checksum }

    await writeCorpoFile(root, c.args.fileId, serializeCorpoFile(updatedMeta, newBody))

    return {
      id: c.args.fileId,
      remote: remoteUri,
      syncedAt,
    }
  },
}
