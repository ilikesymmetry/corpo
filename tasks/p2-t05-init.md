---
id: p2-t05
phase: 2
title: corpo init
status: todo
blockedBy: p2-t04
---

# `corpo init`

Scaffold a new Corpo-enabled repository. This is the entry point for new users
setting up their first Corpo repo.

## Behavior

```
corpo init [path]
```

- Creates a `docs/` directory at the target path (defaults to current
  directory)
- Writes a `.corpo/config.toml` with sensible defaults (repo origin
  auto-detected from `git remote`)
- Writes a starter `docs/README.md` explaining the repo's Corpo structure
- If run inside an existing git repo, detects and confirms before modifying
- Prints next steps: `corpo import`, `corpo new` (future), `corpo serve`

## Config file shape

```toml
[repo]
remote = "github.com/owner/repo"   # auto-detected or prompted

[defaults]
author = "username"                 # pulled from git config
```

## Done when

- [ ] `corpo init` creates `docs/` and `.corpo/config.toml`
- [ ] Auto-detects git remote for config
- [ ] Prints clear next-step instructions
- [ ] Gracefully handles running in a non-git directory (warns, continues)
- [ ] Gracefully handles `docs/` already existing (warns, doesn't overwrite)
