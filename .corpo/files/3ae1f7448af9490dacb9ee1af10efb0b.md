---
title: "Navigation API"
description: "GET and PUT endpoints for the navigation tree. The tree is a recursive Node structure — each node is a file ID string or a named group with children. Persisted in .corpo/config.json."
---

Two endpoints manage the navigation tree that drives the sidebar.

## `GET /api/navigation`

Returns the full navigation tree from `.corpo/config.json`.

**Response `200`:**
```json
{
  "navigation": [
    {
      "group": "Product",
      "children": [
        "5f0d0567687f4d628a8630e96ca20a83",
        { "group": "Features", "children": ["..."] }
      ]
    }
  ]
}
```

A `Node` is either a file ID string or `{ group: string, children: Node[] }`.
Files and subgroups can be freely interleaved at any depth.

## `PUT /api/navigation`

Replaces the entire navigation tree. The client sends the updated tree; the
server writes it to `.corpo/config.json`.

**Body:** `{ "navigation": Node[] }`
**Response:** `204 No Content`
**Errors:** `400` missing or malformed `navigation`

## Implementation

`src/server/index.ts` — Hono routes
`src/server/adapter.ts` — `LocalAdapter.getNavigation()`, `LocalAdapter.putNavigation()`
`.corpo/config.json` — persistent storage
