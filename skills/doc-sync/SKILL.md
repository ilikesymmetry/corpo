---
name: doc-sync
description: >
  End-of-session documentation cleanup for corpo projects. Use when the user
  asks to "clean up the docs", "wrap up the session", "sync the docs", or
  "update the journal". Creates a new session journal file, updates stale
  feature descriptions, and commits everything.
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

Read `.corpo/config.json`. Look at the Journals group to find existing sessions
and determine the next counter N.

```bash
# Check git log for today's work
git log --oneline --since="$(date +%Y-%m-%d) 00:00:00"
git diff HEAD~N --stat
```

---

## Step 2 — Create the new session file

```bash
bun packages/cli/src/index.ts new \
  "Session N — YYYY-MM-DD" \
  "<one-sentence summary of the session>" \
  --group "Journals"
```

This creates the file and inserts it at the end of the Journals group in
navigation automatically.

---

## Step 3 — Write the session content

Write the body to `.corpo/files/{newId}.md`. Add `sidebarTitle: "Session N"`
to the frontmatter.

Structure:

```markdown
---
title: "Session N — YYYY-MM-DD"
sidebarTitle: "Session N"
description: "..."
---

# Session N — YYYY-MM-DD

One-sentence framing of what this session was about.

### Change or feature name

What changed and why. Be specific — name the files, components, commands,
or flags involved. Document bugs fixed and the root cause. Record design
decisions that aren't obvious from the code.
```

Rules:
- Use past tense ("Added", "Fixed", "Extracted", "Renamed")
- Include file/component names so the entry is greedable by future agents
- Group related changes under named subsections
- If something was added and then reverted in the same session, omit it
- Append a **What's Next** section only on the most recent session

---

## Step 4 — Update stale feature files

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

## Step 5 — Lint and commit

```bash
bun packages/cli/src/index.ts lint
```

Fix any orphaned threads or dangling anchors, then commit:

```bash
git add .corpo/ skills/
git commit -m "docs: session N journal and feature file sync (YYYY-MM-DD)"
git push
```
