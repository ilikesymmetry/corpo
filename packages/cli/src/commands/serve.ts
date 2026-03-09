import { z } from 'incur'
import { findRoot } from '../lib/config.ts'
import { createServer } from '../server/index.ts'

export const serve = {
  description: 'Start the local GUI server.',
  options: z.object({
    port: z.number().default(3000).describe('Port to listen on'),
    detach: z
      .boolean()
      .default(false)
      .describe(
        'Run the server in the background and return immediately. Returns { url, pid }. Use this when invoking from an agent or script.',
      ),
  }),
  async run(c: { options: { port: number; detach: boolean } }) {
    const { port, detach } = c.options
    const root = await findRoot()

    if (detach) {
      // Spawn a detached server process and exit immediately.
      // process.execPath = bun binary; process.argv[1] = path to src/index.ts
      const child = Bun.spawn(
        [process.execPath, process.argv[1], 'serve', '--port', String(port)],
        { detached: true, stdio: ['ignore', 'ignore', 'ignore'], env: process.env },
      )
      child.unref()
      return { url: `http://localhost:${port}`, pid: child.pid, detached: true }
    }

    const app = createServer(root)
    const server = Bun.serve({ fetch: app.fetch, port })
    console.log(`corpo serve running at http://localhost:${server.port}`)
    console.log(`Root: ${root}`)
    // Keep alive until Ctrl+C
    await new Promise(() => {})
    return { url: `http://localhost:${server.port}` }
  },
}
