---
id: p2-t10
phase: 2
title: corpo publish
status: todo
blockedBy: p2-t04, p4-t14
---

# `corpo publish`

Register a local Corpo doc with corpo.sh to get a persistent shareable link.

## Behavior

```
corpo publish [id or path]
```

- Reads the doc ID from the file's frontmatter
- Resolves the doc's location in the configured remote repo
- POSTs `{ id, repo, path }` to `corpo.sh/api/docs`
- Prints the persistent link: `https://corpo.sh/{id}`
- If the doc hasn't been saved to a remote repo yet, prompts to `--save` first

## Done when

- [ ] Successfully registers a doc with corpo.sh
- [ ] Prints the persistent link on success
- [ ] Handles the case where the doc isn't in a remote repo yet
- [ ] Idempotent — re-publishing the same doc updates the registration if the
      path has changed
