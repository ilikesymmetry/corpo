# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

Corpo is a git-backed, agent-native file protocol. Files are Markdown with
YAML frontmatter, stored in git repos, and accessible to humans and agents
through persistent links. Designed for bottoms-up adoption — one author, one
repo, no top-down mandate required. Agents are first-class participants in the
read/write loop.

**Current phase:** CLI and GUI are actively in-progress. The local server,
GUI SPA, threading system, and thread resolution are all functional. See
the Features group in the corpo files for per-feature documentation.

## Navigating This Repo

This repo uses corpo. Use the `corpo` skill to orient:

```
skills/corpo/SKILL.md        # read this to understand how to navigate corpo files
.corpo/config.json           # config — start here to find all files
tasks/index.md               # task tracker across all 5 phases
```

The fastest path to orientation:
1. Read `.corpo/config.json` — the first file in `navigation` is the PRD written for agents
2. Resolve the path: `.corpo/files/{file-id}.md`
3. Read that file, then follow the navigation groups for structure

**The `corpo` CLI exists.** Commands: `init`, `serve`, `threads`, `reply`, `resolve`,
`lint`, `new`. Run with `bun packages/cli/src/index.ts <command>`. Read and write corpo
files directly as plain Markdown files on the filesystem when working outside the server.

## File Structure

```
.corpo/
  config.json          # config: remote_files, navigation
  files/               # all corpo files live here
    {file-id}.md
packages/
  cli/                 # CLI source and npm package
  gui/                 # GUI SPA (Vite + React)
skills/
  corpo/
    SKILL.md            # navigation skill
tasks/
  index.md              # task index
  p1-*.md, p2-*.md ...  # individual task files
```

File IDs are UUID v4 with hyphens stripped (32 lowercase hex chars). The
filename is the ID — there is no `id` field in frontmatter.

## Protocol Decisions (Finalized)

These are locked. Do not re-litigate without explicit user instruction.

- **File ID:** UUID v4, hyphens stripped. Filename is the ID. Never changes.
- **Frontmatter fields:** `title` (required), `description` (required, max
  1024 chars), `sidebarTitle` (optional), `import` (if created via `corpo
  import`), `threads` (optional)
- **Thread anchors:** HTML comments in the body — `<!-- thread:{id} -->`.
  Invisible to all Markdown renderers. Thread content lives in frontmatter.
- **Thread IDs:** 8-char random hex, scoped to the file. Replies have no IDs.
- **Resolved threads:** Removed from frontmatter and body. Preserved in git
  history only. No sidecar archive file.
- **Config:** `.corpo/config.json`. No `local_files_root` — local files
  are always at `.corpo/files/` by convention. No `entrypoint` — first file in
  `navigation` is the implicit entry point.
- **Navigation:** `navigation` key in `.corpo/config.json`. Recursive tree of
  nodes: each node is a file ID (string) or `{ group, children: Node[] }`.
  Files and subgroups can be freely interleaved. Depth unrestricted.
- **Cache:** User-level SQLite at `~/.corpo/cache.db`. Binary — cached or not.
- **Remotes:** Two types: `git:github.com/{owner}/{repo}.git` and
  `https://{registry}`. ID = identity, remote = routing.
- **Auth:** Pluggable. GitHub OAuth first (repo visibility = file visibility).

## Open Questions

See `.corpo/files/1e35303f02004066b8b007bc9b3ec9be.md` (Open Questions).
Remaining open: file creation scaffolding, CLI distribution. Okta auth and
GUI are deferred.

## Sync Principle

**Corpo files must stay in sync with implementation.** When adding a new
feature, update or create the relevant corpo file. When a feature's behavior
changes, update its description. The files are the ground truth for what the
system does — stale docs are a bug.

The Features group (`Product > Features`) is the canonical per-feature
reference. Architecture files document structure and design decisions.
Journals document what happened and when.

## Task Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Protocol v1.0 | in-progress |
| 2 | CLI | in-progress |
| 3 | GUI | in-progress |
| 4 | corpo.sh backend | todo |
| 5 | Launch | todo |

See `tasks/index.md` for the full task breakdown.
