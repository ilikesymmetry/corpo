import { Cli, z } from 'incur'
import { findCorpusRoot } from './lib/corpus.ts'
import { createServer } from './server/index.ts'
import { reply } from './commands/reply.ts'
import { threads } from './commands/threads.ts'

const serve = {
  description: 'Start the local viewer server.',
  options: z.object({
    port: z.number().default(3000).describe('Port to listen on'),
  }),
  async run(c: { options: { port: number } }) {
    const root = await findCorpusRoot()
    const app = createServer(root)
    const server = Bun.serve({ fetch: app.fetch, port: c.options.port })
    console.log(`corpo serve running at http://localhost:${server.port}`)
    console.log(`Corpus root: ${root}`)
    // Keep alive until Ctrl+C
    await new Promise(() => {})
    return { url: `http://localhost:${server.port}` }
  },
}

Cli.create('corpo', {
  description: 'Git-backed, agent-native file protocol.',
})
  .command('serve', serve)
  .command('reply', reply)
  .command('threads', threads)
  .serve()
