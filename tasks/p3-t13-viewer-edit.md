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

## Done when

- [ ] Edit button and `e` shortcut open the file in `$EDITOR`
- [ ] Viewer live-reloads within 1 second of the file being saved
- [ ] Falls back gracefully if `$EDITOR` is not set (prints the file path,
      tells the user to open it manually)
- [ ] Works correctly during the `corpo import` flow
