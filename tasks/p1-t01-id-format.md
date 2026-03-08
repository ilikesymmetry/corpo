---
id: p1-t01
phase: 1
title: Finalize ID format
status: todo
---

# Finalize ID format

Define and document the exact format for global document IDs. This is a
protocol primitive — once shipped, it cannot change without breaking existing
links.

## Decisions to make

- **Length**: short enough to be usable in URLs, long enough to avoid
  collisions across many repos. 6-8 alphanumeric characters is the likely
  range.
- **Character set**: lowercase alphanumeric only (`a-z0-9`) is safest for
  URLs and terminals. Avoid ambiguous characters (0/O, 1/l).
- **Generation**: random or content-hash? Random is simpler and avoids
  leaking doc content in the ID.
- **Cross-repo collision**: short IDs are scoped per repo. Fully-qualified ID
  is `{owner}/{repo}:{doc-id}`. Document how the CLI resolves ambiguity when
  the same short ID exists in multiple configured repos.

## Done when

- [ ] ID format is fully specified in `docs/protocol.md`
- [ ] Generation algorithm is documented (how the CLI produces a new ID)
- [ ] Collision handling is documented (what happens when a new ID collides
      with an existing one in the same repo)
- [ ] Cross-repo qualification format is finalized
