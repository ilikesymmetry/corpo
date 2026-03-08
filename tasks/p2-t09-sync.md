---
id: p2-t09
phase: 2
title: corpo sync
status: todo
blockedBy: p2-t04
---

# `corpo sync`

Pull the latest docs from all configured remote repos into the local cache.
This is what keeps the local corpus current for agent use.

## Behavior

```
corpo sync [--repo owner/repo]
```

- Without `--repo`: syncs all repos listed in `.corpo/config.toml`
- With `--repo`: syncs a single specific repo
- Fetches the `docs/` tree from each repo via GitHub API (no git clone needed)
- Writes docs to a local cache at `~/.corpo/cache/{owner}/{repo}/`
- Prints a summary: N docs updated, M docs unchanged, K new docs

## Config shape for multiple repos

```toml
[[repos]]
remote = "github.com/owner/repo-a"

[[repos]]
remote = "github.com/owner/repo-b"
```

## Done when

- [ ] Syncs docs from a configured GitHub repo into local cache
- [ ] Only downloads files that have changed (uses ETags or last-modified)
- [ ] Works with public repos unauthenticated and private repos via
      GitHub token stored in `~/.corpo/credentials.toml`
- [ ] Prints a clean sync summary
- [ ] `corpo sync --repo` targets a single repo
