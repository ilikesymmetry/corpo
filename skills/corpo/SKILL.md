---
name: corpo
description: >
  How to navigate a Corpo corpus on the filesystem. Use this skill whenever
  you're working in a repo that contains a corpo.yaml file, whenever the user
  mentions Corpo files or the corpus, or whenever you need to orient yourself
  at the start of a session — even if the user just says "start here" or
  "get up to speed". This skill tells you exactly how to find, resolve, and
  read files from the corpus.
---

# Corpo

Corpo is a git-backed, agent-native file protocol. Each file is Markdown with
YAML frontmatter, named by a globally unique ID. This skill tells you how to
find and read them.

---

## Step 1 — Detect the corpus

Look for `corpo.yaml` at the repository root. If it exists, this repo has a
Corpo corpus. Read it first.

```yaml
# corpo.yaml shape
local_files_root: corpus        # the local files directory (always "corpus")
entrypoint: <file-id>           # optional — read this file first for orientation

local_files:
  <file-id>: <subdir>           # subdir within local_files_root; "." for root
  <file-id>: <subdir>

remote_files:
  <file-id>: git:github.com/owner/repo.git   # fetched from git remote
  <file-id>: https://corpo.sh                 # fetched from registry API
```

## Step 2 — Orient with the entrypoint

If `entrypoint` is set, resolve and read that file before doing anything else.
It is the designated orientation file for agents — a PRD or hub doc written
specifically to get you up to speed fast.

## Step 3 — Resolve a local file path

Given a file ID from `local_files`:

```
path = {local_files_root}/{subdir}/{file-id}.md
```

**Example:** ID `e75004f4da3a48d0a989b1187b2bd486` mapped to subdir `product`:
```
corpus/product/e75004f4da3a48d0a989b1187b2bd486.md
```

If the subdir value is `.`, the file is directly in `local_files_root/`:
```
corpus/{file-id}.md
```

## Step 4 — Read a file

Every Corpo file has two parts:

**Frontmatter** (YAML between `---` delimiters):
```yaml
title: "Human-readable title"
description: "Plain-text summary, max 1024 chars. Read this first."
import: https://...   # present only if created via `corpo import`
threads:
  <8-char-hex-id>:
    author: username
    at: 2026-03-07T14:23:00Z
    body: "Thread body."
    replies:
      - author: username
        at: 2026-03-07T15:00:00Z
        body: "Reply text."
```

**Body** — Markdown content. Thread positions are marked with HTML comment
anchors that are invisible to renderers:
```
<!-- thread:3a7f2b9c -->
```
A thread is associated with the content immediately preceding its anchor.

## Step 5 — Handle remote files

**The `corpo` CLI does not exist yet.** Do not attempt to invoke any `corpo`
commands — they will fail. All reading and writing must be done directly on
the filesystem using standard tools.

Remote files in `remote_files` are not stored locally in the repo. They would
normally be fetched and cached at `~/.corpo/files/{file-id}.md`, but without
the CLI that infrastructure doesn't exist. If you need content from a remote
file, surface that gap to the user rather than trying to fetch it yourself.

For **local files**, read and write the `.md` files directly — they are plain
Markdown and can be treated as such.

## Key facts to remember

- **The filename is the ID.** There is no `id` field in frontmatter.
- **IDs are permanent.** A file's ID never changes even if it moves or is
  renamed. References to files use IDs, never filenames or paths.
- **`description` is the summary.** For any file, read `description` first —
  it's written specifically to let agents decide whether to read the full body.
- **Threads are in frontmatter, anchors are in the body.** They are stored
  separately by design so content edits and comment additions produce
  non-overlapping diffs.
- **ID = identity, remote = routing.** Where a file is fetched from is a
  config concern. The ID is the stable reference, always.
