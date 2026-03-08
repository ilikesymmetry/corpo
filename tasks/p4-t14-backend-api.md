---
id: p4-t14
phase: 4
title: corpo.sh — KV-backed API
status: todo
---

# corpo.sh — KV-backed API

Build the minimal backend that powers persistent Corpo links. Two endpoints,
one KV store.

## Stack

- Vercel serverless functions (TypeScript)
- Vercel KV (Redis) for `id → { repo, path, owner }` mapping

## Endpoints

### `POST /api/docs`
Register a doc. Called by `corpo publish`.

```json
Request:  { "id": "a3f9b2", "repo": "owner/repo", "path": "docs/a3f9b2.md" }
Response: { "url": "https://corpo.sh/a3f9b2" }
```

Auth: GitHub token in `Authorization` header — validates the caller has read
access to the specified repo before registering.

### `GET /{id}`
Resolve and render a doc.

1. Look up `id` in KV → `{ repo, path }`
2. Fetch the raw markdown from GitHub API
3. Render using the same rendering logic as the local viewer
4. Return HTML

Returns 404 if ID not found. Returns the GitHub error if the file is
inaccessible (e.g. private repo the requester can't read).

## Done when

- [ ] `POST /api/docs` stores the mapping and returns the persistent URL
- [ ] `GET /{id}` fetches and renders the correct doc
- [ ] Auth check on registration prevents registering docs in repos the
      caller doesn't have access to
- [ ] 404 and error states return clean responses
- [ ] KV reads/writes are fast enough that `corpo.sh/{id}` loads in < 500ms
      for a typical doc
