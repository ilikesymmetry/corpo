# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

Corpo is a git-backed, agent-native file protocol. Files are Markdown with
YAML frontmatter, stored in git repos, and accessible to humans and agents
through persistent links. Designed for bottoms-up adoption — one author, one
repo, no top-down mandate required. Agents are first-class participants in the
read/write loop.

**Current phase:** Protocol v1.0 is in human review (in-progress). No CLI or
application code exists yet. All work right now is specification and planning.

## Navigating This Repo

This repo is itself a Corpo corpus. Use the `corpo` skill to orient:

```
skills/corpo/SKILL.md        # read this to understand how to navigate the corpus
.corpo/config.json           # corpus config — start here to find all files
tasks/index.md               # task tracker across all 5 phases
```

The fastest path to orientation:
1. Read `.corpo/config.json` — the first file in `navigation` is the PRD written for agents
2. Resolve the path: `.corpo/files/{file-id}.md`
3. Read that file, then follow the navigation groups for structure

**The `corpo` CLI does not exist yet.** Read and write corpus files directly
as plain Markdown files on the filesystem.

## Corpus Structure

```
.corpo/
  config.json          # corpus config: remote_files, navigation
  files/               # all local corpus files live here
    {file-id}.md
skills/
  corpo/
    SKILL.md            # corpus navigation skill
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
- **Corpus config:** `.corpo/config.json`. No `local_files_root` — local files
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
viewer are deferred.

## Task Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Protocol v1.0 | in-progress |
| 2 | CLI | todo |
| 3 | Viewer | todo |
| 4 | corpo.sh backend | todo |
| 5 | Launch | todo |

Phase 2 (CLI) is blocked on Phase 1 sign-off. Phases 3 and 4 can run in
parallel with Phase 2. See `tasks/index.md` for the full task breakdown.
