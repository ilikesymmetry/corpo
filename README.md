# Corpo

A document protocol for teams that work with AI agents.

Corpo stores docs as markdown in git repos. Every doc has a stable ID, a
shareable link, and a format that agents can read, write, and navigate without
human help. Teams adopt it repo by repo, bottom-up, with no central
coordination required.

---

## The problem

Corporate docs live in Google Docs, Notion, and Confluence — formats designed
for humans reading in a browser. Agents can't navigate them efficiently, can't
write back to them reliably, and can't find what's relevant inside a large doc
without consuming it whole. Every time an agent needs doc content, a human
bridges the gap manually.

Corpo fixes the format. The collaboration workflow stays the same.

---

## How it works

**Docs are markdown files with YAML frontmatter**, stored in a `docs/`
directory in any git repo. The frontmatter is machine-readable metadata —
doc type, status, links to related docs. The body is human-readable content.

**Every doc has a global ID** assigned at creation and stable forever. Rename
it, move it, reorganize the repo — the ID and its persistent link don't change.

**Comments live in the doc** using markdown's reference-link syntax, invisible
to renderers but readable by agents. Resolved threads are archived, not
deleted, so references never break.

**Repo permissions are access control.** Public repo means publicly readable.
Private repo means GitHub login required. No separate permission system.

**The CLI syncs docs locally** from any number of configured repos. Agents
read from the local cache — no API calls mid-session.

---

## Status

Protocol design phase. The spec lives in [`docs/`](docs/). CLI and viewer are
not yet implemented.

- [Discovery](docs/discovery.md) — problem statements and scope
- [User Flows](docs/user-flows.md) — the four primary interaction patterns
- [Protocol Spec](docs/protocol.md) — the stable contracts
- [Migration & Import](docs/migration.md) — bringing existing docs in
- [Open Questions](docs/open-questions.md) — what's still unresolved
