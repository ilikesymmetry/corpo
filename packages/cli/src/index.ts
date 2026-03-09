import { Cli, z } from 'incur'
import { findRoot } from './lib/config.ts'
import { createServer } from './server/index.ts'
import { init } from './commands/init.ts'
import { reply } from './commands/reply.ts'
import { threads } from './commands/threads.ts'
import { lint } from './commands/lint.ts'
import { resolve } from './commands/resolve.ts'
import { newFile } from './commands/new.ts'

const serve = {
  description: 'Start the local GUI server.',
  options: z.object({
    port: z.number().default(3000).describe('Port to listen on'),
  }),
  async run(c: { options: { port: number } }) {
    const root = await findRoot()
    const app = createServer(root)
    const server = Bun.serve({ fetch: app.fetch, port: c.options.port })
    console.log(`corpo serve running at http://localhost:${server.port}`)
    console.log(`Root: ${root}`)
    // Keep alive until Ctrl+C
    await new Promise(() => {})
    return { url: `http://localhost:${server.port}` }
  },
}

Cli.create('corpo', {
  description: 'Git-backed, agent-native file protocol.',
})
  .command('init', init)
  .command('serve', serve)
  .command('reply', reply)
  .command('threads', threads)
  .command('lint', lint)
  .command('resolve', resolve)
  .command('new', newFile)
  .serve()
