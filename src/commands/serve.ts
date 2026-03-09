import { findCorpusRoot } from '../lib/corpus.ts'
import { createServer } from '../server/index.ts'

export async function serveCommand(port = 3000) {
  const root = await findCorpusRoot()
  const app = createServer(root)
  const server = Bun.serve({ fetch: app.fetch, port })
  console.log(`corpo serve running at http://localhost:${server.port}`)
  console.log(`Corpus root: ${root}`)
  // Keep alive until Ctrl+C
  await new Promise(() => {})
}
