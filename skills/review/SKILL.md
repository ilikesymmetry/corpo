---
name: review
description: >
  Leave design review feedback on a corpo file as threads. Use when asked to
  "review this file", "do a design pass", "leave feedback on", or "read and
  comment on" a corpo file. Reads the full file, identifies inconsistencies,
  gaps, design flaws, and better alternatives, then adds one thread per finding
  using `corpo comment`. Never edits the document body — only adds threads.
---

# Design Review

A design review pass leaves structured feedback as threads on a corpo file.
The goal is to surface inconsistencies, gaps, redundancies, design flaws, and
better alternatives — without making any changes to the document itself.

---

## Step 1 — Read the full file

```sh
bun packages/cli/src/index.ts threads <fileId>
```

Note any threads already open so you don't duplicate feedback. Then read the
full file:

```sh
cat .corpo/files/<fileId>.md
```

Read everything from frontmatter to the last line before flagging anything.
Missing context causes false positives.

---

## Step 2 — Identify findings

Work through the document looking for:

- **Inconsistencies** — sections that contradict each other (e.g. a Non-Goal
  that is fully covered by a User Flow)
- **Gaps** — behavior or edge cases left unaddressed (e.g. what happens on
  error, what a flow omits, edge cases implied but not stated)
- **Redundancies** — two things that do the same job, creating ambiguity about
  which to use
- **Design flaws** — decisions that will cause problems in implementation
  (e.g. an interface signature that doesn't cover a requirement stated
  elsewhere in the doc)
- **Better alternatives** — places where a simpler or more consistent approach
  exists

Aim for 3–6 substantive findings. Avoid nitpicks and style comments; focus
on things that would mislead an implementor or block progress. If there are
more than 6 real issues, note that the document may need a rewrite and let
the author decide how to proceed.

---

## Step 3 — Add threads

For each finding, add a thread at the relevant line:

```sh
bun packages/cli/src/index.ts comment <fileId> <line> "<body>"
```

`<line>` is the 1-based line number of the last line of the content the
comment is attached to. Place the anchor immediately after the relevant
sentence or section — not at the start of the next heading.

> **`corpo comment` is a planned CLI command.** Until it is implemented, add
> threads manually: insert `<!-- thread:{id} -->` on a new line after the
> target line in the body, and add a matching entry to the `threads:` block
> in frontmatter. Generate the ID as 8 random lowercase hex chars.

Write comment bodies that:

- State the specific problem in the first sentence
- Explain *why* it matters (what would break or confuse an implementor)
- Propose a concrete resolution or ask a pointed question

After each `corpo comment`, run `corpo lint <fileId>` to verify anchor
integrity before continuing.

---

## Step 4 — Report

Tell the user how many threads were added and give a one-sentence summary of
each finding so they can triage in the GUI or reply in order.

---

## Rules

- **Read first, comment second.** Never add a thread after reading only part
  of the file.
- **Threads only — no edits.** This skill never modifies the document body.
  Changes are made by the author and resolved via the `resolve-threads` skill.
- **One issue per thread.** Don't bundle multiple problems into one comment.
  Separate threads can be resolved independently.
- **Anchor precisely.** Place the anchor at the end of the content being
  flagged, not at the nearest heading above it.
- **3–6 findings per pass.** More than that is a signal the doc needs a
  rewrite, not a review.
