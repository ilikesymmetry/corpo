---
name: corpo
description: >
  How to navigate corpo files on the filesystem. Use this skill whenever
  you're working in a repo that contains a .corpo/ directory, whenever the user
  mentions corpo files, or whenever you need to orient yourself
  at the start of a session — even if the user just says "start here" or
  "get up to speed". This skill tells you exactly how to find, resolve, read,
  and write corpo files, and how to use the CLI.
---

# Corpo

Corpo is a git-backed, agent-native file protocol. Files are Markdown with
YAML frontmatter, stored in git repos, and named by a globally unique ID.

**Package:** `@ilikesymmetry/corpo` — **Requires:** [Bun](https://bun.sh) ≥ 1.0

---

## Step 1 — Check CLI availability

```bash
corpo --help
```

If `corpo` is not found, install it:

```bash
# Install Bun first (if not already installed)
curl -fsSL https://bun.sh/install | bash
# or: npm install -g bun

# Then install corpo
npm install -g @ilikesymmetry/corpo
```

If working inside the corpo source repo itself, invoke directly without a global install:

```bash
bun packages/cli/src/index.ts <command>
```

Run `corpo --help` or `corpo <command> --help` at any time for the full option reference.

---

## Step 2 — Detect corpo files

Look for `.corpo/config.json` by walking up from the current working directory.
If it exists, this repo has corpo files. Read it first.

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

## Step 3 — Orient from navigation

The `navigation` key in `.corpo/config.json` is your structural index. Group
labels are semantic signals. The first file listed in the first group is the
implicit entry point — read it first for orientation.

All local files live at `.corpo/files/{file-id}.md`. Resolve any file ID from
the navigation by reading that path directly.

## Step 4 — Read a file

Every corpo file has two parts:

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

## Step 5 — Handle remote files

Remote files declared in `remote_files` are not stored locally in the repo.
If you need content from a remote file and the CLI can't resolve it, surface
that gap to the user.

For **local files**, read and write `.corpo/files/{file-id}.md` directly —
they are plain Markdown and can be treated as such.

## Step 6 — Use the CLI

The `corpo` CLI handles thread operations, file creation, validation, and
serving the local GUI. All commands support `--help` for full option details.

| Command | Description |
|---|---|
| `corpo init` | Initialize a new `.corpo/` directory in the current repo |
| `corpo new <title> <description> [--group <path>]` | Create a new corpo file; optionally place it in navigation |
| `corpo mv <fileId> <groupPath>` | Move a file to a navigation group (use `""` for root) |
| `corpo threads <fileId>` | List all threads with a `needsResponse` flag |
| `corpo reply <fileId> <threadId> <body>` | Append a reply to a thread |
| `corpo resolve <fileId> <threadId>` | Resolve (close) a thread |
| `corpo lint [fileId]` | Validate thread anchor integrity across files |
| `corpo serve [--port N]` | Start the local GUI server |
| `corpo update` | Update corpo to the latest version from npm |

Use `corpo threads` to audit what needs a response. Use `corpo reply` to post
acknowledgements and confirmations. Do not invoke `corpo serve` unless the user
explicitly asks — it blocks the process.

---

## Key facts

- **The filename is the ID.** There is no `id` field in frontmatter.
- **IDs are permanent.** A file's ID never changes even if it moves or is
  renamed. References always use IDs, never filenames or paths.
- **`description` is the summary.** Read it first — it is written specifically
  to let agents decide whether to read the full body.
- **Threads are in frontmatter, anchors are in the body.** Stored separately
  so content edits and comment additions produce non-overlapping diffs.
- **ID = identity, remote = routing.** Where a file is fetched from is a
  config concern. The ID is the stable reference, always.
- **Navigation is the index.** `.corpo/config.json` navigation groups give
  you the full structural picture in one read.
- **`corpo lint` after edits.** Run lint after writing to any `.corpo/files/*.md`
  to catch orphaned threads or dangling anchors before committing.
