---
name: resolve-threads
description: >
  Resolve outstanding threads in a Corpo corpus file. Use when the user asks to
  "resolve threads", "address comments", or "act on feedback" for a specific file.
  Reads all threads, identifies ones requesting content changes, executes each
  change, then replies once to confirm.
---

# Resolve Threads

Reads all threads in a Corpo file, acts on those requesting content changes, and
replies once per thread after the change is saved.

---

## Step 1 — List threads

```sh
bun src/index.ts threads <fileId>
```

Returns a JSON array. Each entry has:
- `id` — 8-char hex thread ID
- `author` — who opened the thread
- `body` — the original comment
- `replies` — `[{ author, timestamp, body }]`
- `needsResponse` — `true` if the last speaker is not `claude`

Focus on threads where `needsResponse: true`. Read the body (and last reply if any)
to determine whether it's requesting a content change. Skip threads that are purely
discussional with no actionable ask.

---

## Step 2 — For each actionable thread

Process threads one at a time in order.

### 2a — Execute the change

Read the file at `.corpo/files/<fileId>.md`. The thread anchor
`<!-- thread:<threadId> -->` in the body marks the content the comment is attached
to — use it to locate the relevant section. Make the requested change with the Edit
tool.

**Anchor integrity:** if the change removes a section that contains a thread anchor,
also remove that thread from frontmatter. If it removes a frontmatter thread, also
remove its anchor from the body. Frontmatter threads and body anchors must stay in
1:1 sync — `corpo lint <fileId>` will flag any mismatch.

### 2b — Reply once the change is saved

No upfront acknowledgement — reply only after the edit is complete:

```sh
bun src/index.ts reply <fileId> <threadId> "Done: <one sentence describing what changed>"
```

---

## Step 3 — Report

After all threads are processed, give the user a brief summary: what was changed,
and what (if anything) was skipped and why.

---

## Rules

- **Reply after, not before.** No acknowledgement reply — one reply per thread,
  after the change is saved, to prompt re-review.
- **One thread at a time.** Process threads sequentially — do not batch changes from
  multiple threads into a single file edit. Each change should be auditable on its own.
- **Keep anchors in sync.** When editing content, always check whether thread anchors
  are affected. Run `corpo lint <fileId>` to verify before replying.
- **Skip discussional threads.** Not every thread is a request. If a thread is a
  comment, question, or observation with no clear ask, skip it and note why in the
  final report.
- **Clarify instead of guessing.** If a thread is ambiguous, reply to ask for
  clarification rather than making a best-guess edit.
