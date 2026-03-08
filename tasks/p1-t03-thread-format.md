---
id: p1-t03
phase: 1
title: Finalize thread format
status: done
---

# Finalize thread format

Define the exact syntax and behavior of inline threads (comments) in Corpo
docs. Threads are the collaboration primitive — this needs to be right before
the viewer is built.

## Decisions to make

- **Syntax**: current proposal is markdown reference-link definitions:
  `[thread:a1b2c3]: {...}`. Confirm this is the right base syntax and that
  it renders invisibly in all major markdown renderers.
- **Payload format**: JSON inline or YAML? JSON is more compact. Confirm
  required fields: `author`, `at` (ISO timestamp), `body`, `replies[]`.
- **Anchoring**: proximity rule (thread refers to content immediately above)
  is the current proposal. Is this precise enough? Does the viewer need an
  explicit anchor index?
- **Archive format**: resolved/deleted threads move to `{doc-id}.threads.md`.
  Confirm the exact structure of that file.
- **Global reference format**: `{doc-id}#thread:a1b2c3` — confirm this is
  the canonical way to hyperlink to a specific thread from any doc or system.
- **Reply IDs**: are reply IDs local to the thread or globally unique?

## Done when

- [ ] Full thread syntax is specified in `docs/protocol.md` with examples
- [ ] Archive file format is specified
- [ ] Global reference format is confirmed
- [ ] Viewer rendering behavior is documented (what the thread looks like to
      a reader)
- [ ] At least one major markdown renderer (GitHub, VSCode) confirmed to
      render threads invisibly
