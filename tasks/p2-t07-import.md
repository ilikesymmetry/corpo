---
id: p2-t07
phase: 2
title: corpo import
status: todo
blockedBy: p2-t04, p2-t06-new, p2-t06-auth
---

# `corpo import`

Fetch a Google Doc, convert it to a Corpo markdown file, and open the local
viewer for verification. This is the hero demo command.

## Behavior

```
corpo import [url] [flags]

Flags:
  --google     Explicit Google Docs adapter (auto-detected from URL if omitted)
  --save       Commit the imported doc to the configured Corpo repo
  --publish    Register with corpo.sh and return a persistent link
```

## Flow

1. Detect adapter from URL (Google Docs URLs auto-select `--google`)
2. Fetch document content via Google Docs API using stored credentials
3. Convert to Corpo markdown:
   - Generate a new doc ID
   - Write YAML frontmatter (`id`, `type: note`, `status: draft`, `created`,
     `author`, `source: [original url]`)
   - Convert document body (headings, paragraphs, tables, lists)
   - Preserve table structure — critical for PPS format
4. Write to a temp file (or `docs/` if `--save`)
5. Spawn local viewer (`corpo serve --file [path]`), open in browser
6. Print the local file path and next steps

## Flags behavior

- **Default (no flags)**: file written to current directory as `{id}.md`,
  not committed anywhere
- **`--save`**: committed to `docs/` in the configured Corpo repo
- **`--publish`**: implies `--save`, then registers with corpo.sh, prints
  `corpo.sh/{id}`

## Done when

- [ ] Fetches a real Google Doc and produces valid Corpo markdown
- [ ] Frontmatter is complete and correct
- [ ] Tables are preserved (critical for PPS docs)
- [ ] Viewer opens automatically on import
- [ ] `--save` commits to the configured repo
- [ ] `--publish` registers with corpo.sh and prints the link
- [ ] Handles auth errors, network errors, and malformed URLs gracefully
