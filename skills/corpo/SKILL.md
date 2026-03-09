---
name: corpo
description: >
  How to navigate a Corpo corpus on the filesystem. Use this skill whenever
  you're working in a repo that contains a .corpo/ directory, whenever the user
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

Look for `.corpo/config.json` by walking up from the current working directory.
If it exists, this repo has a Corpo corpus. Read it first.

```json
{
  "remote_files": {
    "<file-id>": "git:github.com/owner/repo.git",
    "<file-id>": "https://corpo.sh"
  },
  "navigation": [
    {
      "group": "<group-label>",
      "children": [
        "<file-id>",
        "<file-id>",
        { "group": "<subgroup-label>", "children": ["<file-id>"] }
      ]
    }
  ]
}
```

## Step 2 — Orient from navigation

The `navigation` key in `.corpo/config.json` is your structural index. Group
labels are semantic signals. The first file listed in the first group is the
implicit entry point — read it first for orientation.

All local files live at `.corpo/files/{file-id}.md`. Resolve any file ID from
the navigation by reading that path directly.

## Step 3 — Read a file

Every Corpo file has two parts:

**Frontmatter** (YAML between `---` delimiters):
```yaml
title: "Human-readable title"
description: "Plain-text summary, max 1024 chars. Read this first."
sidebarTitle: "Short nav label"   # optional, falls back to title
import: https://...               # present only if created via `corpo import`
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

## Step 4 — Handle remote files

**The `corpo` CLI does not exist yet.** Do not attempt to invoke any `corpo`
commands — they will fail. All reading and writing must be done directly on
the filesystem using standard tools.

Remote files declared in `remote_files` are not stored locally in the repo.
They would normally be fetched and cached at `~/.corpo/files/{file-id}.md`,
but without the CLI that infrastructure doesn't exist. If you need content
from a remote file, surface that gap to the user rather than trying to fetch
it yourself.

For **local files**, read and write `.corpo/files/{file-id}.md` directly —
they are plain Markdown and can be treated as such.

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
- **Navigation is the index.** `.corpo/config.json` navigation groups give
  you the full structural picture of the corpus in one read.
