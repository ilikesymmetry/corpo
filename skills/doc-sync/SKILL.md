---
name: doc-sync
description: >
  End-of-session documentation cleanup for corpo projects. Use when the user
  asks to "clean up the docs", "wrap up the session", "sync the docs", or
  "update the journal". Audits the journal for missing session coverage,
  updates stale feature descriptions, and adds newly created features to
  navigation.
---

Run at the end of a working session to keep corpo files in sync with the
implementation. Stale docs are a bug — this skill fixes them.

## Overview of Steps

1. Check git log for today's changes
2. Check the journal for coverage gaps
3. Update stale feature files (Product > Features)
4. Add missing entries to navigation if any new files were created
5. Commit and push

---

## Step 1 — Orient

```bash
bun packages/cli/src/index.ts threads <journalFileId>
```

Read `.corpo/config.json` for navigation structure. Identify:
- The journal file(s) under the **Journals** group
- The feature files under **Product > Features** relevant to what changed

---

## Step 2 — Audit git log for today's changes

```bash
git log --oneline --since="$(date +%Y-%m-%d) 00:00:00"
git diff HEAD~N --stat   # N = number of today's commits
```

Read the commit messages and diffs to understand what was built, changed, or
fixed today. This is the ground truth for what goes in the journal.

---

## Step 3 — Update the journal

Read the journal file at `.corpo/files/{journalFileId}.md`.

Check whether today's work is already covered. If not, append a new
continuation section at the bottom:

```markdown
---

## Session Continuation — YYYY-MM-DD

Brief framing sentence (one line).

### Feature or change name

What changed and why. Be specific — name the files, components, commands,
or flags involved. Document bugs fixed and the root cause. Record design
decisions that aren't obvious from the code.
```

Rules:
- Use past tense ("Added", "Fixed", "Extracted", "Renamed")
- Include file/component names so the entry is greedable
- Group related changes under named subsections
- Don't repeat what's already covered in earlier sections of the same file

---

## Step 4 — Update stale feature files

For each feature file that covers something that changed today:

1. Read the current feature file
2. Read the relevant implementation files (source of truth)
3. Identify gaps: wrong component names, stale prop names, wrong state
   ownership, outdated behavior descriptions
4. Rewrite the affected sections to match reality

Commonly stale fields:
- `description` frontmatter (first thing agents read — must be accurate)
- Component/file names in the Implementation section
- State ownership ("state lives in X" claims)
- Prop names passed between components

If the feature was renamed or significantly restructured, update the `title`
and `description` frontmatter too.

---

## Step 5 — Add new features to navigation

If new feature files were created during the session and aren't in navigation:

```bash
bun packages/cli/src/index.ts mv <fileId> "Product/Features/CLI"
# or
bun packages/cli/src/index.ts new "<title>" "<description>" --group "Product/Features/Client"
```

Verify `.corpo/config.json` navigation after any edits.

---

## Step 6 — Lint and commit

```bash
bun packages/cli/src/index.ts lint
```

Fix any orphaned threads or dangling anchors before committing.

Then commit all corpo file changes together:

```bash
git add .corpo/
git commit -m "docs: sync journal and feature files for YYYY-MM-DD session"
git push
```

---

## Tips

- The journal is a log, not a spec. Write it for future-you trying to
  reconstruct why something is the way it is.
- Feature files are specs, not logs. They describe current behavior, not
  history. Rewrite stale sections — don't append corrections.
- If something was added and then removed in the same session, omit it from
  the journal. Only document what's in the final state.
- The `description` frontmatter field is what agents read first. Keep it
  accurate — it's the most important field in any corpo file.
