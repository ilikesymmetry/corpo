---
id: p3-t12
phase: 3
title: Viewer — thread renderer
status: todo
blockedBy: p1-t03, p3-t11
---

# Viewer — thread renderer

Render inline threads (comments) in the viewer. Threads are stored in two
places in a corpus file: anchors (`<!-- thread:{id} -->`) as HTML comments
in the Markdown body, and thread content (author, timestamp, body, replies)
in the `threads` frontmatter key. The viewer must surface both.

## Thread format

Body anchor (HTML comment, invisible to standard renderers):
```
<!-- thread:3a7f2b9c -->
```

Frontmatter thread data:
```yaml
threads:
  3a7f2b9c:
    author: conner
    at: 2026-03-07T14:23Z
    body: "Does this hold at p99?"
    replies:
      - author: alice
        at: 2026-03-07T15:01Z
        body: "Checked — yes."
```

## Scope

1. In `MarkdownRenderer.tsx`, before passing `content` to markdown-it, scan the body string for `<!-- thread:{id} -->` patterns using a regex:
   ```ts
   const THREAD_ANCHOR_RE = /<!--\s*thread:([a-f0-9]{8})\s*-->/g
   ```
   Replace each match with a placeholder HTML element the client controls:
   ```ts
   content.replace(THREAD_ANCHOR_RE, (_, id) =>
     `<span data-thread-id="${id}" class="thread-anchor"></span>`
   )
   ```
   Pass the replaced string to markdown-it. The HTML comment is gone; the `<span>` is preserved.

2. After `dangerouslySetInnerHTML` renders the markdown-it output, use a `useEffect` to find all `[data-thread-id]` elements in the DOM and mount a `ThreadIndicator` React component at each one (via a React portal or by replacing the span contents).

3. Create `src/components/ThreadIndicator.tsx` — receives `threadId` and the full `threads` data object from the parent file's parsed frontmatter (`data.threads`). Looks up `data.threads[threadId]` for the thread content:
   - Renders a small inline marker (e.g. a chat bubble icon or a colored dot) at the anchor position
   - Clicking the marker toggles an expanded panel below/beside the anchor
   - Collapsed by default

4. The expanded thread panel displays:
   - Thread author and formatted timestamp (`at`)
   - Thread body
   - Replies in chronological order, each with author, timestamp, and body
   - Read-only at MVP — adding new threads or replies from the viewer is post-MVP

5. Pass `data.threads` down from `FileView.tsx` through `MarkdownRenderer.tsx` to `ThreadIndicator.tsx`. No global state needed for MVP.

6. Resolved threads are removed from frontmatter and body before committing (see p3-t13). The viewer simply does not render an indicator when there is no thread anchor in the body.

## Thread UI

- Thread indicator: small inline icon or dot rendered at the `<span data-thread-id>` position
- Expanded panel: author, timestamp, body, replies in chronological order
- Collapsed by default; expanded on click
- Read-only at MVP

## Done when

- [ ] Thread anchors (`<!-- thread:{id} -->`) are scanned from the raw body before passing to markdown-it
- [ ] Each anchor is replaced with a `<span data-thread-id="{id}">` placeholder
- [ ] `ThreadIndicator` is mounted at each placeholder after render
- [ ] Thread data is looked up from `data.threads[id]` (parsed frontmatter)
- [ ] Clicking an indicator expands the panel with author, timestamp, body, and replies
- [ ] Multiple threads on a page work independently
- [ ] Files with no threads render identically to files without thread anchors
