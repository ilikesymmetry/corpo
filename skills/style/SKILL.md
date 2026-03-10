---
name: style
description: >
  Enforce corpo file style by iteratively running the linter, fixing all
  flagged issues, and relinting until the output is clean. Use when asked to
  "fix lint", "clean up style", "run style enforcement", or "fix corpus
  references". Operates on a single file or all files.
---

# Style Enforcement

Runs `corpo lint`, fixes every flagged issue, and repeats until the linter
exits clean. Each rule has a deterministic fix; no judgment calls are needed.

---

## Step 1 — Run the linter

```sh
# Single file
bun packages/cli/src/index.ts lint <fileId>

# All files
bun packages/cli/src/index.ts lint
```

If the output is `ok: true`, stop — everything is already clean.

Each error line has the form:

```
<fileId>: [<rule>] <detail>
```

Collect all errors before touching any file.

---

## Step 2 — Group errors by file

Fix one file at a time. For each file:

1. Read `.corpo/files/<fileId>.md`
2. Apply every fix for that file (see rules below)
3. Save once — do not write intermediate states

---

## Step 3 — Apply fixes by rule

### `word-corpus`

The word "corpus" is banned. Replace every occurrence with the contextually
correct alternative:

| Original phrase | Replacement |
|---|---|
| `corpus file` | `corpo file` |
| `the corpus` (referring to the collection of files) | `the corpo files` |
| `corpus` standing alone as a noun | `file` |

**How to locate:** the detail string says either `body line N` or
`frontmatter <field>`. Use that to find the exact location in the file.

- For body hits: read the line, find the word, replace in context.
- For frontmatter hits: find the field (`title:`, `description:`, or the
  thread `body:` under `threads.<id>`), replace in context.

After replacing, re-read the surrounding sentence to confirm it reads
naturally. If the replacement is awkward, choose the other option (`file` vs
`corpo file`) — both are acceptable.

### `orphaned-thread`

A thread ID appears in frontmatter but has no anchor in the body. Two options:

- If the thread is still meaningful: insert `<!-- thread:<id> -->` after the
  relevant line in the body.
- If the thread is obsolete: remove the thread entry from frontmatter entirely.

Use your judgment based on the thread content. When in doubt, remove — orphaned
threads usually mean the section they referenced was deleted.

### `dangling-anchor`

An anchor `<!-- thread:<id> -->` appears in the body but has no entry in
frontmatter. Remove the anchor from the body.

---

## Step 4 — Relint

After fixing all files, run the linter again:

```sh
bun packages/cli/src/index.ts lint
```

If new errors appear (e.g. a fix introduced a regression), fix those too.
Repeat until the linter exits with `ok: true`.

---

## Step 5 — Report

Tell the user:
- How many files were changed
- A summary of what was fixed (e.g. "replaced 12 instances of 'corpus'
  across 3 files")
- Any judgment calls made (e.g. an orphaned thread that was removed vs
  re-anchored)

---

## Rules

- **Fix, don't ask.** Every rule has a deterministic fix. Do not ask the
  user which replacement to use — pick the contextually appropriate one.
- **One write per file per pass.** Read, apply all fixes for that file,
  write once. Avoid partial writes that could leave a file in an invalid state.
- **Relint after every pass.** Never assume a single pass is sufficient.
  Fixes can expose new issues (e.g. frontmatter edits that shift anchor lines).
- **Preserve thread anchor integrity.** After any body edit, run lint on
  that file before moving to the next. A broken anchor is worse than a style
  violation.
