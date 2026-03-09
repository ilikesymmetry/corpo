---
id: p2-t08
phase: 2
title: corpo serve
status: todo
blockedBy: p2-t04
---

# `corpo serve`

Start a local HTTP server that exposes the corpo server API and serves the
viewer client. The server is a thin I/O layer against the local filesystem.
See [Viewer Architecture](../.corpo/files/c7a9b2e1f5d34c8a9b3e7f1d2c6b5a4e.md)
and [Server API](../.corpo/files/d8b4f3e2a1c54f9bb2e8c1d6f3e5b7a2.md).

## Behavior

```
corpo serve [--port 3000]
```

- Finds `.corpo/config.json` by walking up from CWD (same as git)
- Binds to `localhost` on the specified port (default 3000)
- Serves the viewer SPA at `/` — assets embedded in the binary
- Port conflict: tries next available port, prints which was used
- Opens the browser automatically on start
- `Ctrl+C` stops the server

## Endpoints

Six endpoints. Local and remote files are treated uniformly by ID — the
server resolves the distinction internally.

**`GET /api/navigation`** — reads and returns the `navigation` array from
`.corpo/config.json`.

**`PUT /api/navigation`** — receives `{ navigation }`, writes the updated
navigation array to `.corpo/config.json`.

**`GET /api/files/:id`** — reads `.corpo/files/{id}.md` (local) or fetches
from the configured remote, returns raw content as `text/plain`.

**`POST /api/files`** — receives `{ raw }`, generates a new file ID, writes
to `.corpo/files/{id}.md`, returns `{ id }`.

**`PUT /api/files/:id/commit`** — receives `{ raw }`, writes to the
appropriate location (local: `.corpo/files/{id}.md`).

**`DELETE /api/files/:id`** — local: deletes `.corpo/files/{id}.md`; remote:
removes from `remote_files` in `.corpo/config.json`. In both cases, also
removes the ID from all navigation groups in `.corpo/config.json` atomically.

## Scope

Concrete implementation steps in order. Each step maps to a file to create.

### Step 1 — `src/lib/id.ts`

Create `generateId()`:

```ts
import { randomUUID } from 'node:crypto'

export const generateId = () => randomUUID().replace(/-/g, '')
```

### Step 2 — `src/lib/corpus.ts`

Three functions used by the adapter and every other command that touches the corpus:

```ts
import { access, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export async function findCorpusRoot(start = process.cwd()): Promise<string> {
  let dir = start
  while (true) {
    try {
      await access(join(dir, '.corpo', 'config.json'))
      return dir
    } catch {
      const parent = dirname(dir)
      if (parent === dir) throw new Error('Not inside a Corpo corpus')
      dir = parent
    }
  }
}

export async function readConfig(root: string) {
  const raw = await readFile(join(root, '.corpo', 'config.json'), 'utf8')
  return JSON.parse(raw)
}

export async function writeConfig(root: string, config: unknown) {
  await writeFile(
    join(root, '.corpo', 'config.json'),
    JSON.stringify(config, null, 2),
  )
}
```

### Step 3 — `src/lib/files.ts`

File-level helpers. Keep these thin — no business logic:

```ts
import { access, readFile, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

function filePath(root: string, id: string) {
  return join(root, '.corpo', 'files', `${id}.md`)
}

export async function readCorpoFile(root: string, id: string): Promise<string | null> {
  try {
    return await readFile(filePath(root, id), 'utf8')
  } catch (e: any) {
    if (e.code === 'ENOENT') return null
    throw e
  }
}

export async function writeCorpoFile(root: string, id: string, raw: string): Promise<void> {
  await writeFile(filePath(root, id), raw)
}

export async function deleteCorpoFile(root: string, id: string): Promise<void> {
  await unlink(filePath(root, id))
}

export async function fileExists(root: string, id: string): Promise<boolean> {
  try {
    await access(filePath(root, id))
    return true
  } catch {
    return false
  }
}
```

### Step 4 — `src/server/adapter.ts`

`LocalAdapter` is the only place that touches the filesystem. Hono routes call adapter methods only.

The `removeFromNavigation` helper is a private module-level function — not exported:

```ts
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { readConfig, writeConfig } from '../lib/corpus.ts'
import { readCorpoFile, writeCorpoFile, fileExists } from '../lib/files.ts'
import { generateId } from '../lib/id.ts'

type Node = string | { group: string; children: Node[] }

function removeFromNavigation(nodes: Node[], id: string): Node[] {
  return nodes
    .filter(node => node !== id)
    .map(node => {
      if (typeof node === 'string') return node
      return { ...node, children: removeFromNavigation(node.children, id) }
    })
}

export class LocalAdapter {
  constructor(private root: string) {}

  async getNavigation() {
    const config = await readConfig(this.root)
    return config.navigation
  }

  async putNavigation(navigation: Node[]) {
    const config = await readConfig(this.root)
    await writeConfig(this.root, { ...config, navigation })
  }

  async getFile(id: string): Promise<string | null> {
    return readCorpoFile(this.root, id)
  }

  async createFile(raw: string): Promise<string> {
    const id = generateId()
    await writeCorpoFile(this.root, id, raw)
    return id
  }

  async commitFile(id: string, raw: string): Promise<void> {
    if (!await fileExists(this.root, id)) {
      throw Object.assign(new Error('File not found'), { code: 'NOT_FOUND' })
    }
    await writeCorpoFile(this.root, id, raw)
  }

  async deleteFile(id: string): Promise<void> {
    const config = await readConfig(this.root)
    let found = false

    // Local file
    try {
      await unlink(join(this.root, '.corpo', 'files', `${id}.md`))
      found = true
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e
    }

    // Remote file entry
    if (config.remote_files?.[id]) {
      delete config.remote_files[id]
      found = true
    }

    if (!found) throw Object.assign(new Error('File not found'), { code: 'NOT_FOUND' })

    // Strip ID from navigation and persist
    config.navigation = removeFromNavigation(config.navigation, id)
    await writeConfig(this.root, config)
  }
}
```

### Step 5 — `src/server/index.ts`

Hono app with `onError` hook. Routes are thin — delegate everything to the adapter:

```ts
import { Hono } from 'hono'
import { LocalAdapter } from './adapter.ts'

export function createServer(root: string) {
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
    const { navigation } = await c.req.json()
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
    const { raw } = await c.req.json()
    if (!raw) return c.json({ error: 'missing raw' }, 400)
    const id = await adapter.createFile(raw)
    return c.json({ id }, 201)
  })

  app.put('/api/files/:id/commit', async (c) => {
    const { raw } = await c.req.json()
    if (!raw) return c.json({ error: 'missing raw' }, 400)
    await adapter.commitFile(c.req.param('id'), raw)
    return c.body(null, 204)
  })

  app.delete('/api/files/:id', async (c) => {
    await adapter.deleteFile(c.req.param('id'))
    return c.body(null, 204)
  })

  // Viewer SPA — must be last
  app.get('*', serveViewer())

  return app
}
```

`serveViewer()` is the embedded SPA handler — see [API Server Implementation](../.corpo/files/a9c2e1f4b3d54e8fa1b2c3d4e5f6a7b8.md) for the import pattern.

### Step 6 — `src/commands/serve.ts`

Wire up `createServer` with `Bun.serve`:

```ts
import { createServer } from '../server/index.ts'
import { findCorpusRoot } from '../lib/corpus.ts'

export const serve = {
  description: 'Start the local viewer server.',
  options: z.object({
    port: z.number().default(3000).describe('Port to listen on'),
  }),
  outputPolicy: 'agent-only',
  async run(c) {
    const root = await findCorpusRoot()
    const app = createServer(root)

    const server = Bun.serve({ fetch: app.fetch, port: c.options.port })

    if (!c.agent) {
      console.log(`Viewer running at http://localhost:${server.port}`)
      Bun.openInEditor(`http://localhost:${server.port}`)
    }

    // Keep alive until Ctrl+C
    await new Promise(() => {})

    return { url: `http://localhost:${server.port}` }
  },
}
```

### Step 7 — Manual testing with curl

See "Dev testing with curl" section below.

## Dev testing with curl

Start the server first:

```sh
bun run src/index.ts serve --port 3000
# or after compile:
./corpo serve --port 3000
```

**GET navigation:**
```sh
curl http://localhost:3000/api/navigation
# → { "navigation": [...] }
```

**PUT navigation** (replace the full tree):
```sh
curl -X PUT http://localhost:3000/api/navigation \
  -H 'Content-Type: application/json' \
  -d '{"navigation": [{"group": "Docs", "children": ["abc123def456abc123def456abc123de"]}]}'
# → 204
```

**GET file:**
```sh
curl http://localhost:3000/api/files/abc123def456abc123def456abc123de
# → raw markdown text/plain, or 404 if not found
```

**POST file** (create new):
```sh
curl -X POST http://localhost:3000/api/files \
  -H 'Content-Type: application/json' \
  -d '{"raw": "---\ntitle: \"Test file\"\ndescription: \"A test.\"\n---\n\nBody here."}'
# → 201 { "id": "<generated-id>" }
```

**PUT commit** (write full file content):
```sh
curl -X PUT http://localhost:3000/api/files/abc123def456abc123def456abc123de/commit \
  -H 'Content-Type: application/json' \
  -d '{"raw": "---\ntitle: \"Updated title\"\ndescription: \"Updated.\"\n---\n\nUpdated body."}'
# → 204, or 404 if file not found
```

**DELETE file:**
```sh
curl -X DELETE http://localhost:3000/api/files/abc123def456abc123def456abc123de
# → 204, or 404 if not found in local files or remote_files
```

**Error shape** (for any 4xx/5xx):
```sh
curl http://localhost:3000/api/files/doesnotexist00000000000000000000
# → 404 { "error": "file not found" }
```

## Done when

- [ ] Server starts and binds to localhost
- [ ] Viewer SPA loads at `http://localhost:{port}/`
- [ ] `GET /api/navigation` returns navigation from `.corpo/config.json`
- [ ] `PUT /api/navigation` writes navigation back to `.corpo/config.json`
- [ ] `GET /api/files/:id` returns raw file content as `text/plain`
- [ ] `GET /api/files/:id` returns 404 for unknown ID
- [ ] `POST /api/files` generates a new file ID, writes file, returns `{ id }` with 201
- [ ] `PUT /api/files/:id/commit` writes raw content to disk
- [ ] `PUT /api/files/:id/commit` returns 404 for unknown ID
- [ ] `DELETE /api/files/:id` deletes local file or removes remote entry
- [ ] `DELETE /api/files/:id` strips ID from all navigation groups atomically
- [ ] `DELETE /api/files/:id` returns 404 when ID not found in local or remote
- [ ] All errors return `{ "error": "..." }` JSON — 400, 404, or 500
- [ ] Opens browser automatically on start
- [ ] Port conflict handled gracefully
- [ ] Assets embedded in binary — no external CDN dependencies
