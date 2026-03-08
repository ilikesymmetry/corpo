# Context Manager — Protocol Specification

_See also: [Discovery](discovery.md) · [User Flows](user-flows.md)_

These are the stable contracts that define the protocol. Implementations
(CLI, viewer, editor, adapters) must conform to these primitives. The protocol
is designed to be adopted by any team using GitHub-hosted repos, public or
private.

---

## 1. Global Document ID

Every document has a globally unique ID assigned at creation time. IDs are
stable forever — renaming, moving, or archiving a doc never changes its ID.
The ID is the canonical address of the document.

**Format:** Short opaque string (e.g. `a3f9b2`). Not human-readable, not
path-dependent. Fully-qualified ID across repos: `{repo}:{doc-id}`.

**Persistent link:** `{host}/{doc-id}` resolves to the current canonical
location regardless of which repo or path the doc lives in.

**Cross-repo collision:** Short IDs are scoped per repo. The CLI resolves short
IDs within the scope of configured repos and surfaces ambiguity when the same
short ID exists in multiple repos.

---

## 2. Document File Format

Markdown with YAML frontmatter. Frontmatter is the machine-readable metadata
layer; the markdown body is the human-readable content.

**Filename:** `{doc-id}.md`

**Minimum frontmatter:**

```yaml
id: a3f9b2
type: pps | tdd | hub | brief | note
status: draft | review | aligned | archived
created: 2026-03-07
author: conner
source: https://docs.google.com/...    # optional; present on imported docs
links:
  - id: b7c2d1
    rel: parent | related | supersedes
```

The `source` field enables deduplication: if two authors independently import
the same external doc, the CLI detects the collision via matching `source`
values before creating a duplicate.

**Progressive disclosure:** Agents read frontmatter first. The frontmatter and
link graph are the index. Agents traverse only the sections or linked docs they
need for a given task — never consuming an entire hub doc in one shot.

---

## 3. Repository Structure

Docs live in a `docs/` directory at the root of a git repository. This is the
standard Corpo drop-in location — the CLI assumes `docs/` by default with no
configuration required.

Within `docs/`, the directory structure mirrors the human org hierarchy. The
directory tree is the authority hierarchy.

```
docs/
  {org}/
    {team}/
      {project}/
        {doc-id}.md
        {doc-id}.threads.md
```

For repos where all docs belong to a single team or project, a flat structure
inside `docs/` is fine. The hierarchy is optional depth, not required nesting.

**Repo visibility = doc visibility.** Public repo: publicly readable, no login
required. Private repo: login required, read access mirrors repo access. No
additional permission system is introduced at the doc level.

---

## 4. Multi-Repo Aggregation

The protocol is repo-agnostic. A CLI instance can be configured against many
repos simultaneously. There is no requirement for a single canonical repo.

Teams adopt at their own pace. Any team can create a repo, start writing docs,
and participate in the protocol without top-down coordination. An org-level
consumer aggregates across all repos they have access to.

The CLI maintains a local cache of docs from all configured repos. `sync` pulls
the latest versions. Individual docs can be fetched on-demand by ID, path, or
source URL.

---

## 5. Thread / Comment Format

Comments are embedded in the markdown file using markdown's native
reference-link definition syntax — invisible to standard renderers, fully
readable by agents and editors.

**Format:**

```
[thread:a1b2c3]: {"author":"conner","at":"2026-03-07T14:23Z","body":"Should we add a fourth option?","replies":[{"id":"d4e5f6","author":"teammate","at":"2026-03-07T15:00Z","body":"Yes, agreed."}]}
```

**Anchoring:** A thread is anchored by proximity — it refers to the content
immediately preceding the reference definition in the document.

**Global reference:** `{doc-id}#thread:a1b2c3` — usable as a hyperlink from
any doc or system.

**Resolution:** When a thread is resolved or deleted, it is removed from the
doc body and appended verbatim to a companion archive file
(`{doc-id}.threads.md`). Existing thread IDs remain referenceable forever via
the archive; no links break.

---

## 6. Auth

Auth is a pluggable primitive. The protocol defines extension points; it does
not mandate an implementation.

**Extension points:**
- **Read auth** — controls who can resolve a persistent link
- **Write auth** — controls who can commit changes to a doc or thread
- **Viewer auth** — controls access to the browser-based rendered view

**Planned implementations, in order:**

1. **GitHub OAuth** — repo visibility is doc visibility. Public repo: no login.
   Private repo: GitHub login, access mirrors repo permissions. Zero mapping,
   zero separate ACL.
2. **Okta SSO (SAML)** — for enterprise orgs that require it.
3. **Repo-level access tokens** — for CLI and agent access without a browser
   session.
