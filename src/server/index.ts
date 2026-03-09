import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { LocalAdapter } from './adapter.ts'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

export function createServer(root: string): Hono {
  const app = new Hono()
  const adapter = new LocalAdapter(root)

  app.onError((err: any, c) => {
    const status = err.code === 'NOT_FOUND' ? 404 : 500
    return c.json({ error: err.message }, status)
  })

  app.get('/api/navigation', async (c) => {
    return c.json({ navigation: await adapter.getNavigation() })
  })

  app.put('/api/navigation', async (c) => {
    const body = await c.req.json()
    const { navigation } = body
    if (!navigation) return c.json({ error: 'missing navigation' }, 400)
    await adapter.putNavigation(navigation)
    return c.body(null, 204)
  })

  app.get('/api/files/:id', async (c) => {
    const file = await adapter.getFile(c.req.param('id'))
    if (file === null) return c.json({ error: 'file not found' }, 404)
    return c.text(file)
  })

  app.post('/api/files', async (c) => {
    const body = await c.req.json()
    const { raw } = body
    if (!raw) return c.json({ error: 'missing raw' }, 400)
    const id = await adapter.createFile(raw)
    return c.json({ id }, 201)
  })

  app.put('/api/files/:id/commit', async (c) => {
    const body = await c.req.json()
    const { raw } = body
    if (!raw) return c.json({ error: 'missing raw' }, 400)
    await adapter.commitFile(c.req.param('id'), raw)
    return c.body(null, 204)
  })

  app.delete('/api/files/:id', async (c) => {
    await adapter.deleteFile(c.req.param('id'))
    return c.body(null, 204)
  })

  // Hashed static assets (JS, CSS) from viewer/dist/assets/
  app.use('/assets/*', serveStatic({ root: join(import.meta.dir, '../../viewer/dist') }))

  // SPA shell — all other routes return index.html (client-side routing handles the rest)
  app.get('*', async (c) => {
    const index = await readFile(join(import.meta.dir, '../../viewer/dist/index.html'), 'utf8')
    return c.html(index)
  })

  return app
}
