# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A git-backed, agent-native document protocol and CLI. Docs are written as
markdown with YAML frontmatter, stored in GitHub repos, and surfaced to humans
via a lightweight web viewer with persistent shareable links. Designed for
bottoms-up adoption across teams of any size, with agents as first-class
participants in the read/write loop.

The current state of this repo is discovery and protocol design. No code exists
yet. Start here before writing anything:

- [`discovery.md`](discovery.md) — problem statements and project scope
- [`user-flows.md`](user-flows.md) — the four primary user flows
- [`protocol.md`](protocol.md) — the protocol specification (IDs, file format, threads, auth)
- [`migration.md`](migration.md) — import adapter interface and adoption path
- [`open-questions.md`](open-questions.md) — deferred decisions and out-of-scope items

## Protocol Design Principles

**Global doc IDs are stable forever.** A doc's ID never changes regardless of
rename, move, or repo transfer. Fully-qualified ID: `{repo}:{doc-id}`.

**Repo structure mirrors org hierarchy.** `/{org}/{team}/{project}/{doc-id}.md`
— the directory tree is the authority hierarchy. Repo-level permissions are the
access control primitive; no separate ACL.

**Repo visibility = doc visibility.** Public repo → no auth required. Private
repo → GitHub OAuth, access mirrors repo permissions.

**Progressive disclosure for agents.** Agents read frontmatter first, traverse
the link graph, and pull only what they need. Never consume an entire hub doc
in one shot.

**Threads live in the markdown file.** Comments use markdown reference-link
syntax (`[thread:{id}]: {...}`), invisible to renderers, readable by agents.
Resolved threads move to a companion `{doc-id}.threads.md` archive so IDs
remain referenceable forever.

**Import adapters are pluggable.** The CLI ships a Google Docs adapter. The
adapter interface is public for community implementations (Notion, Confluence,
etc.).

## Key Open Decisions (Check Before Implementing)

See [`open-questions.md`](open-questions.md) for the current list. Most
significant unresolved items:

- Global ID format and cross-repo collision strategy
- Thread anchor precision (proximity rule vs. explicit syntax)
- Viewer/editor implementation approach
