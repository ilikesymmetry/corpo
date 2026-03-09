---
name: resolve-threads
description: >
  Resolve outstanding threads in a Corpo corpus file. Use when the user asks to
  "resolve threads", "address comments", or "act on feedback" for a specific file.
  Reads all threads, identifies ones requesting content changes, acknowledges each,
  executes the change, then confirms completion.
---

# Resolve Threads

Reads all threads in a Corpo file, acts on those requesting content changes, and
marks each as resolved with reply confirmations.

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

### 2a — Acknowledge

Reply immediately before making any edits:

```sh
bun src/index.ts reply <fileId> <threadId> "Acknowledged: <one sentence describing what you'll do>"
```

### 2b — Execute the change

Read the file at `.corpo/files/<fileId>.md`. The thread anchor
`<!-- thread:<threadId> -->` in the body marks the content the comment is attached
to — use it to locate the relevant section. Make the requested change with the Edit
tool.

### 2c — Confirm

Reply to close the loop:

```sh
bun src/index.ts reply <fileId> <threadId> "Done: <one sentence describing what changed>"
```

---

## Step 3 — Report

After all threads are processed, give the user a brief summary: what was changed,
and what (if anything) was skipped and why.

---

## Rules

- **Acknowledge before acting.** Always post the acknowledgement reply before making
  any edits. This lets the human track progress even if you're interrupted.
- **One thread at a time.** Process threads sequentially — do not batch changes from
  multiple threads into a single file edit. Each change should be auditable on its own.
- **Skip discussional threads.** Not every thread is a request. If a thread is a
  comment, question, or observation with no clear ask, skip it and note why in the
  final report.
- **Clarify instead of guessing.** If a thread is ambiguous, or the requested change
  can't be found or doesn't make sense in context, reply to ask for clarification
  rather than making a best-guess edit.
