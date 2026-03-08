---
id: p2-t06
phase: 2
title: corpo new
status: todo
blockedBy: p2-t04, p1-t01, p1-t02
blocks: p2-t07
---

# `corpo new`

Create a new Corpo doc with a generated ID and correct frontmatter. This is
the canonical entry point for creating docs natively and houses the shared
internals used by `corpo import`.

## Behavior

```
corpo new [--type pps|tdd|hub|brief|note] [--title "..."]
```

- Generates a new globally unique doc ID (per the finalized ID format)
- Writes a new `.md` file to `docs/` (or current directory if not in a Corpo
  repo) with complete YAML frontmatter
- Opens the file in `$EDITOR` immediately so the author can start writing
- Prompts interactively for `--type` and `--title` if not provided as flags

## Shared internals

The following are implemented here and reused by `corpo import`:

- **ID generation**: random short ID, collision-checked against existing docs
  in the local cache and configured repo
- **Frontmatter writer**: takes `{ id, type, status, author, source? }` and
  produces a valid frontmatter block
- **File scaffolding**: writes the `.md` file with frontmatter header and a
  blank body ready for content

## Done when

- [ ] `corpo new` generates a valid ID and writes a correctly structured file
- [ ] Frontmatter passes validation (all required fields present, correct
      enum values)
- [ ] Opens `$EDITOR` after creation
- [ ] ID generation and frontmatter writer are implemented as reusable
      internal functions, not inline in the command handler
- [ ] Collision detection works against local docs
- [ ] Interactive prompts work when flags are omitted
