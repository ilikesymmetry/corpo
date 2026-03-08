# Context Manager — User Flows

_See also: [Discovery](discovery.md), [Protocol](protocol.md)_

These are the primary interaction patterns the system must support. They are
ordered from the most basic entry point (importing existing content) to more
sophisticated agent-driven workflows.

---

## Flow 1 — Import an Existing Doc

**Trigger:** An author has a doc that already exists elsewhere (Google Doc,
Notion page, etc.) and wants it available in the system.

**Interaction:**
The author provides a source URL to the CLI or Claude Code. The import adapter
fetches the content, converts it to markdown, assigns a global ID, writes the
correct frontmatter (including a `source:` field pointing back to the
original), and commits it to the appropriate repo path. The CLI returns a
persistent link.

**Resync:** If the source doc has changed since the last import, the author can
trigger a resync. The CLI fetches the latest version and presents a diff
against the current local version. The author reviews and accepts or rejects
the update.

**Dedup:** If a doc with the same `source:` URL already exists in any
configured repo, the CLI surfaces it before creating a duplicate.

**Outcome:** The doc is agent-readable, has a stable persistent link, and is
available in the local cache for use in any Claude Code session.

---

## Flow 2 — Create a New Doc

**Trigger:** An author wants to write something new — a brief, a PPS, a project
hub, a decision record.

**Interaction:**
The author tells Claude Code what kind of doc they want to write and provides
initial notes or context. Claude Code asks the structured questions needed for
that doc type (problem framing, options, criteria, etc.) and pulls relevant
context from the local doc cache autonomously — prior decisions, linked docs,
project history — without the author having to assemble it manually.

Claude Code generates a markdown draft with correct frontmatter. The author
opens the persistent link in the viewer, reads the rendered output, adds inline
comments, and makes edits. When satisfied, they copy the persistent link and
share it (e.g. drop it in Slack).

**Collaboration loop:**
Teammates click the link, read the rendered doc, and leave comments. The author
can delegate revisions back to Claude Code, which reads the open threads and
updates the doc accordingly. This loop repeats until the doc reaches its goal
state (aligned, archived, etc.).

**Outcome:** A structured, agent-readable doc with a persistent shareable link.
Teammates can read and comment without installing anything (public repo) or
with GitHub login (private repo).

---

## Flow 3 — Execute on an Aligned Doc

**Trigger:** A doc (typically a PPS) has reached consensus. The author is
responsible for carrying out or delegating the next steps.

**Interaction:**
The author opens a new Claude Code session, drops the persistent doc URL, and
gives a natural language instruction ("do it", "implement option B", "create
the tickets for this"). The agent fetches the doc, reads the frontmatter to
confirm type and status, identifies the aligned decision from the doc body, and
traverses linked context as needed — without the author re-explaining anything.

The agent executes: creates Linear tickets, opens GitHub branches, implements
code, pushes PRs. Human review is preserved at the appropriate points (code
review, PR approval before merge).

**Outcome:** Implementation that faithfully reflects the agreed decision.
The doc is the source of truth; the author doesn't re-summarize it.

---

## Flow 4 — Maintain a Long-Lived Reference Doc

**Trigger:** A decision has been made that should update a persistent reference
doc (e.g. a Protocol TDD, a system overview, an architecture doc).

**Interaction:**
As part of or following Flow 3 execution, the agent recognizes — from doc
metadata and links — that a persistent reference doc needs updating. It
proposes a diff: a set of specific changes to the reference doc that reflect
the new decision.

The author (or designated reviewer) reviews the proposed changes in a
familiar PR-style flow. They approve or request adjustments. On approval, the
changes are committed.

**Outcome:** Persistent reference docs stay current after every decision,
automatically, without a designated maintainer doing manual work.
