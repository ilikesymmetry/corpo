---
name: journal
description: >
  End-of-session documentation for corpo projects. Use when the user asks to
  "write the journal", "wrap up the session", "write session notes", or
  "update the journal". Commits outstanding code changes (with user consent),
  creates a new session journal file tracking the commit range, updates stale
  feature descriptions, and commits the docs.
---

Run at the end of a working session to keep corpo files in sync with the
implementation. Stale docs are a bug — this skill fixes them.

## Journal convention

One corpo file per session, in the **Journals** navigation group. Files are
titled and sidebar-labeled with an auto-incrementing counter starting at 0:

```
Session 0 — YYYY-MM-DD   (sidebarTitle: "Session 0")
Session 1 — YYYY-MM-DD
Session 2 — YYYY-MM-DD
...
```

The counter is global across all dates — it never resets. Multiple sessions on
the same date get the same date but different counters (e.g., Sessions 3 and 4
both on 2026-03-09).

---

## Step 1 — Orient and find the next counter

Read `.corpo/config.json`. Find the Journals group, determine the next counter
N, and read the most recent journal file to get its `commit` field — this is
the start of the commit range for this session.

---

## Step 2 — Commit outstanding changes

Check for uncommitted work:

```bash
git status
git diff --stat
```

If there are staged or unstaged changes, show the diff summary to the user and
ask for consent before committing:

> "There are uncommitted changes in: [list files]. Commit these before writing
> the journal?"

Once the user approves, commit with an appropriate message. If there is nothing
to commit, skip this step.

After committing (or if nothing to commit), record the current HEAD SHA — this
becomes the `commit` field for the new journal entry:

```bash
git rev-parse HEAD
```

---

## Step 3 — Review the commit range

Use the previous journal's `commit` field as the start of the range. If no
previous journal exists or it has no `commit` field, fall back to
`git log --oneline --since="$(date +%Y-%m-%d) 00:00:00"`.

```bash
git log <prev-commit>..HEAD --oneline
git diff <prev-commit>..HEAD --stat
```

Read through every commit in the range. This is the ground truth for what
changed this session — use it to drive the journal content and to identify
which feature files may need updating.

---

## Step 4 — Create the new session file

```bash
bun packages/cli/src/index.ts new \
  "Session N — YYYY-MM-DD" \
  "<one-sentence summary of the session>" \
  --group "Journals"
```

Then write the body to `.corpo/files/{newId}.md`. Add `sidebarTitle` and
`commit` to the frontmatter:

```markdown
---
title: "Session N — YYYY-MM-DD"
sidebarTitle: "Session N"
description: "..."
commit: "<HEAD SHA from Step 2>"
---
```

The `commit` field is what the next session will use as the start of its
commit range.

---

## Step 5 — Gather insights and reflections

Before writing, ask the user:

> "Any insights or reflections from this session you want included in the journal?"

Wait for their response. Incorporate what they share into a **Reflections**
section in the journal body (see Step 6). If they have nothing to add, skip
the section.

---

## Step 6 — Write the session content

Structure:

```markdown
# Session N — YYYY-MM-DD

One-sentence framing of what this session was about.

### Change or feature name

What changed and why. Be specific — name the files, components, commands,
or flags involved. Document bugs fixed and the root cause. Record design
decisions that aren't obvious from the code.

## Reflections

User-supplied insights from the session — framings, patterns noticed,
workflow improvements, open questions. Written in first person from the
author's perspective. Do not paraphrase heavily; capture the author's
own language and framing as closely as possible.
```

Rules:
- Use past tense ("Added", "Fixed", "Extracted", "Renamed")
- Include file/component names so the entry is greedable by future agents
- Group related changes under named subsections
- If something was added and then reverted in the same session, omit it
- Append a **What's Next** section only on the most recent session
- The **Reflections** section comes after all change entries, before **What's Next**

---

## Step 7 — Update stale feature files

For each feature file under **Product > Features** that covers something
that changed this session:

1. Read the feature file
2. Read the relevant implementation files (source of truth)
3. Rewrite stale sections to match reality — don't append corrections

Commonly stale fields:
- `description` frontmatter (first thing agents read — must be accurate)
- Component/file names in the Implementation section
- State ownership ("state lives in X" claims)
- Prop names passed between components

Feature files are specs, not logs. Rewrite them to describe current behavior.

---

## Step 8 — Lint and commit

```bash
bun packages/cli/src/index.ts lint
```

Fix any orphaned threads or dangling anchors, then commit:

```bash
git add .corpo/ skills/
git commit -m "docs: session N journal and feature file sync (YYYY-MM-DD)"
git push
```
