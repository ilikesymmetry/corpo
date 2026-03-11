import { z } from 'incur'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { findRoot, readConfig, writeConfig, navInsert, parseGroupPath } from '../lib/config.ts'
import { createCorpoFile } from '../lib/files.ts'
import { serializeCorpoFile } from '../lib/frontmatter.ts'
import { parseUserUri, extractH1, uriLastSegment } from '../lib/remote.ts'

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

export const clone = {
  description: 'Clone an external markdown file into corpo as a first-class file.',
  args: z.object({
    uri: z.string().describe('Source URI — local path or GitHub URL (https://github.com/...)'),
  }),
  options: z.object({
    title: z.string().optional().describe('Override the auto-extracted title'),
    group: z.string().optional().describe(
      'Navigation group path to place the file in (e.g. "Product/Features"). Creates groups that don\'t exist.',
    ),
  }),
  async run(c: { args: { uri: string }; options: { title?: string; group?: string } }) {
    const root = await findRoot()
    const { normalizedUri, adapter } = parseUserUri(c.args.uri)

    // Fetch the content from the source
    const body = await adapter.read()

    // Determine title: explicit flag > H1 in body > last URI segment
    const title =
      c.options.title ??
      extractH1(body) ??
      uriLastSegment(c.args.uri)

    const description = `Cloned from ${normalizedUri}.`
    const syncedAt = new Date().toISOString()
    const checksum = sha256(body)

    const meta = {
      title,
      description,
      remote: normalizedUri,
      syncedAt,
      checksum,
    }

    const raw = serializeCorpoFile(meta, body)
    const id = await createCorpoFile(root, raw)

    let group: string | undefined
    if (c.options.group !== undefined) {
      const groupPath = parseGroupPath(c.options.group)
      const config = await readConfig(root)
      config.navigation = navInsert(config.navigation, id, groupPath)
      await writeConfig(root, config)
      group = groupPath.length > 0 ? groupPath.join('/') : '(root)'
    }

    return {
      id,
      path: join('.corpo', 'files', `${id}.md`),
      remote: normalizedUri,
      syncedAt,
      group,
    }
  },
}
