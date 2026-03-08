---
id: p3-t11
phase: 3
title: Viewer — markdown + frontmatter renderer
status: todo
---

# Viewer — markdown + frontmatter renderer

Build the core rendering layer of the local viewer. This is what users see
when `corpo serve` or `corpo import` opens the browser.

## Scope

The viewer is a local web UI served by the CLI binary. It should be
self-contained — no external CDN dependencies, assets embedded in the binary.

**Frontmatter panel**: rendered as a clean metadata sidebar or header — doc
type, status, author, created date, links to related docs.

**Markdown body**: standard markdown rendering. Particular attention to:
- Tables (critical for PPS format)
- Code blocks
- Headings with anchor links

**Design**: minimal, clean, readable. Not a generic markdown preview — it
should feel like a purpose-built doc reader. Dark and light mode.

## Done when

- [ ] Markdown body renders correctly including tables and code blocks
- [ ] Frontmatter is displayed cleanly (not as raw YAML)
- [ ] Related doc links in frontmatter are clickable (open the linked doc
      in the viewer if cached locally)
- [ ] Page title is set to the doc's first heading or ID
- [ ] Renders cleanly on a modern browser at standard window widths
