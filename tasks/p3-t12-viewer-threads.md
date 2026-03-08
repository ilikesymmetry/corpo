---
id: p3-t12
phase: 3
title: Viewer — thread renderer
status: todo
blockedBy: p1-t03, p3-t11
---

# Viewer — thread renderer

Render inline threads (comments) in the viewer. Threads are stored as
`[thread:id]: {...}` reference-link definitions in the markdown source —
invisible to standard renderers, but the viewer must surface them.

## Behavior

- Parse thread definitions from raw markdown before rendering
- Render thread indicators inline — a subtle marker adjacent to the anchored
  content (the content immediately preceding the thread definition)
- Clicking a thread indicator expands a comment panel showing the thread body
  and any replies
- Collapsed by default; expanded on click
- Resolved threads (in the archive file) are not shown in the viewer unless
  explicitly requested

## Thread UI

- Thread indicator: small icon or highlight on the anchored text
- Expanded panel: author avatar/name, timestamp, body, replies in
  chronological order
- Read-only at MVP — adding threads from the viewer is post-MVP

## Done when

- [ ] Thread definitions are parsed from raw markdown source
- [ ] Thread indicators appear adjacent to anchored content
- [ ] Clicking expands the thread panel with author, timestamp, body, replies
- [ ] Multiple threads on a page work independently
- [ ] Docs with no threads render identically to docs without thread syntax
