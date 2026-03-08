---
id: p1-t02
phase: 1
title: Finalize frontmatter schema
status: todo
---

# Finalize frontmatter schema

Lock the YAML frontmatter fields that every Corpo doc must or may include.
This schema is what the CLI writes on creation and what agents read for
progressive disclosure.

## Decisions to make

- **Required vs optional fields**: `id`, `type`, `status`, `created`, `author`
  are the current candidates for required. Confirm or adjust.
- **Type enum**: current candidates are `pps | tdd | hub | brief | note`.
  Are these the right set for MVP? Should type be open-ended (any string)?
- **Status enum**: `draft | review | aligned | archived`. Confirm.
- **Links format**: the current `links: [{id, rel}]` structure — confirm `rel`
  values (`parent | related | supersedes`) and whether ID here is short or
  fully-qualified.
- **Source field**: optional, used for imported docs. Confirm format
  (original URL as string).
- **Extensibility**: how should unknown fields be treated by the CLI and
  viewer? Ignore silently or warn?

## Done when

- [ ] Full schema with required/optional designation is in `docs/protocol.md`
- [ ] All enum values are finalized
- [ ] Example frontmatter block in the spec is accurate and complete
- [ ] CLI validation rules are documented (what makes a doc invalid)
