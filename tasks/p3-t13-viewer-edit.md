---
id: p3-t13
phase: 3
title: Viewer — edit trigger
status: todo
blockedBy: p3-t11
---

# Viewer — edit trigger

Let users jump from the viewer to their editor and return seamlessly. Used
during `corpo import` to fix conversion errors before saving or publishing.

## Behavior

- An "Edit" button (or `e` keyboard shortcut) opens the doc's source file in
  `$EDITOR` (falls back to `$VISUAL`, then system default)
- The viewer watches the file for changes and live-reloads automatically
- No save/confirm step in the viewer — the round-trip is: edit in editor,
  save file, viewer refreshes

## Scope

1. In `FileView.tsx`, track local edit state:
   - `body: string` — the current Markdown body (initialized from `content` returned by `useFile`)
   - `dirty: boolean` — true when `body` differs from the last fetched `content`

   Keep `data` (frontmatter) as a separate state field, also mutable. Both are initialized when `useFile` resolves and reset when the user navigates to a different file.

2. Add an inline "Edit" button (or `e` keyboard shortcut via a `keydown` listener in `useEffect`) that switches the file view into edit mode. In edit mode, replace the `MarkdownRenderer` output with a `<textarea>` pre-populated with `body`.

3. As the user types in the textarea, update `body` in local state. Set `dirty = true` whenever `body !== lastFetchedContent`. Do not call any API endpoint on keystroke.

4. Show a visible dirty indicator (e.g. an unsaved badge or dot on the Save button) when `dirty` is true.

5. Serialize on save — when the user clicks Save (or presses `Cmd+S` / `Ctrl+S`):
   - Rebuild the raw Markdown string from current local state:
     ```ts
     import matter from 'gray-matter'
     const raw = matter.stringify(body, data)
     ```
   - Call `commitFile(id, raw)` from `src/lib/api.ts` (`PUT /api/files/:id/commit`)
   - On success: set `dirty = false`, update `lastFetchedContent` to the committed `raw`
   - On error: surface an error message without discarding local state

6. Discard/cancel — provide a "Discard changes" action that resets `body` and `data` back to `lastFetchedContent` and sets `dirty = false`. Prompt for confirmation if `dirty` is true.

7. Thread operations (add, reply, resolve) also mutate local state and set `dirty = true`. They share the same save path — the commit endpoint always receives the full rebuilt file. (Thread mutation implementation detail is covered in p3-t12 and future thread-write tasks.)

8. The viewer watches the file for external changes via polling or a WebSocket event from the server (`corpo serve` can emit a reload signal on file change). Live-reload resets local state — prompt the user if `dirty` is true before overwriting.

9. An "Edit" button (or `e` shortcut) opens the doc's source file in `$EDITOR`:
   - Call a server-side endpoint (to be defined in the CLI phase) that shells out to `$EDITOR`
   - Falls back to `$VISUAL`, then the system default
   - If no editor is set, display the file path and instruct the user to open it manually

## Done when

- [ ] Edit button and `e` shortcut open the file in `$EDITOR`
- [ ] Viewer live-reloads within 1 second of the file being saved
- [ ] Falls back gracefully if `$EDITOR` is not set (prints the file path,
      tells the user to open it manually)
- [ ] Works correctly during the `corpo import` flow
- [ ] Content edits update `body` in local state without triggering a commit
- [ ] `dirty` flag is set when local state diverges from last-fetched content
- [ ] Dirty indicator is visible in the UI
- [ ] Save serializes frontmatter + body with `matter.stringify` and calls `PUT /api/files/:id/commit`
- [ ] Successful save clears the dirty flag
- [ ] Discard changes resets local state to last-fetched, with confirmation when dirty
