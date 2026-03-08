# Context Manager — Migration & Import

_See also: [Discovery](discovery.md), [Protocol](protocol.md)_

---

## Philosophy

Migration is a non-event. There is no "migration project." The system is
adopted incrementally by individuals and teams at their own pace. Historical
docs that are not actively referenced can stay in Google Docs indefinitely —
they don't need to migrate until they become relevant as agent context.

---

## Import Flow

An author provides a source URL to the CLI. The CLI runs the appropriate
adapter:

1. Fetches and converts content to the markdown doc format
2. Assigns a global ID
3. Writes frontmatter including `source:` field
4. Checks all configured repos for an existing doc with the same `source:` URL
   and warns before creating a duplicate
5. Commits to the configured repo path
6. Returns the persistent link

The author can then share this link exactly as they would have shared the
original Google Doc link — no change to the Slack-and-share workflow.

---

## Resync

If the source doc changes after import, the author runs a resync. The CLI
fetches the latest version from the source and presents a diff against the
current local version. The author reviews and accepts or rejects the update.

Resync is manual and author-initiated. There is no automatic polling of source
docs.

---

## Adapter Interface

The Google Doc adapter ships with the CLI. The adapter interface is public —
anyone can implement an adapter for another source system.

An adapter must implement:

- `fetch(url) → raw content` — retrieve content from the source
- `convert(raw) → markdown` — convert to the markdown doc format
- `resync(url, current) → diff` — fetch latest and diff against current version

**Known adapters:**
- Google Docs (ships with CLI)
- Notion (community)
- Confluence (community)

---

## Adoption Path

The system is designed for bottoms-up adoption:

1. An author installs the CLI and configures one repo
2. They import their first doc or write a new one natively
3. They share a persistent link in Slack — teammates click it and see a
   rendered doc with no installation required (public repo) or after a GitHub
   login (private repo)
4. Teammates who want to write docs natively install the CLI themselves

No top-down mandate is required. Adoption can start with a single author and
expand organically to a team, then an org.
