---
id: p2-t08
phase: 2
title: corpo serve
status: todo
blockedBy: p2-t04
---

# `corpo serve`

Spawn a local web server that renders Corpo docs in the browser. Called
automatically by `corpo import` and available standalone for browsing the
local doc cache.

## Behavior

```
corpo serve [path]
```

- Without a path: serves all docs in the local cache, shows an index
- With a path: serves a single doc file directly (used by `corpo import`)
- Binds to `localhost` on an available port (default 4747)
- Opens the browser automatically
- Watches the file for changes and live-reloads (useful during editing)
- `Ctrl+C` stops the server

## Done when

- [ ] Server starts and renders a Corpo doc at `localhost:4747`
- [ ] Live-reload works when the file is edited externally
- [ ] Index view lists all local docs when no path is specified
- [ ] Opens browser automatically on start
- [ ] Port conflict handled gracefully (tries next available port)
