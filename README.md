# Corpo

A context-management layer for project teams and their agents.

Corpo gives teams a shared wiki that agents can read, write, and navigate natively — no copy-paste, no lost context. Files live in your git repo as plain Markdown, sync across repositories via cloning primitives, and surface in a GUI designed for the way humans actually review: highlight, comment, and iterate with your agent until it's right.

Learn more at [ilikesymmetry.github.io/corpo](https://ilikesymmetry.github.io/corpo).

---

## Get started

Install the corpo skill from the official repo:

```bash
npx skills add github.com/ilikesymmetry/corpo
```

Then say:

```
/corpo set me up
```

The skill will initialize corpo in your current repo, create a starter file, and get you ready to draft.

---

## Workflow

The loop that works:

1. Chat with your agent about something you want to write
2. Ask the agent to write it to a corpo file
3. Open the GUI (`corpo serve`) to view the draft
4. Highlight text to leave comments on the draft
5. Ask the agent to resolve threads (`/resolve-threads`)
6. Review the agent's changes and replies, resolving threads as you go
7. When satisfied, ask the agent to do its own review (`/review`)
8. Reply to the agent's comments
9. Ask the agent to resolve threads again
10. Share the GitHub Pages link with teammates for their review

---

## Features

1. **Agent-ready collaborative GUI** — browse, draft, and comment on docs with your agent via a local server or GitHub Pages
2. **Self-hosted pages for sharing** — any corpo repo gets a hosted GUI on GitHub Pages, no backend required
3. **Full Markdown support + comment threads** — threads attach to any block of content and live alongside the doc in git
4. **Cross-repository wiki building** — clone files from other repos, pull updates, and push changes back with `corpo clone / pull / push`

