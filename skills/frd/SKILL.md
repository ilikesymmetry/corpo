---
name: frd
description: >
  Write or update a Feature Requirements Doc (FRD) in the corpo corpus.
  Use when the user says "write a requirements doc", "spec out [feature]",
  "plan [feature]", "write an FRD for...", or before implementing any
  significant new feature. Also use proactively when asked to build something
  non-trivial that doesn't yet have a requirements doc — propose writing one
  before touching code.
---

# Feature Requirements Doc (FRD)

An FRD is the primary alignment artifact for a feature. It captures what we're
building, why, and what good looks like — written collaboratively before
engineering begins. It stays alive as the product evolves and serves as the
standing context for any engineering agent working on that feature.

---

## Step 0 — Decide: new doc or edit existing?

**Create a new FRD when:**
- The feature has a distinct identity not already covered by an existing doc
- It introduces a new user-facing surface, mode, or capability
- It has its own goals and user flows that don't fit naturally inside another doc

**Edit an existing FRD when:**
- The change extends or constrains behavior already described in a doc
- The scope is small enough to be a section addition or requirement update
- No new top-level goals or user flows are introduced

**No FRD needed:**
- Bug fixes, cosmetic changes, refactors
- Configuration tweaks with no behavioral effect
- Small additive changes (a new CLI flag, a style adjustment)

If unclear, ask the user before proceeding.

---

## Step 1 — Create the file

```sh
bun packages/cli/src/index.ts new "<Feature Name>" "<1–2 sentence description of what this is and why it matters>" --group "Product/Features/<Category>"
```

Category is usually one of: `CLI`, `API`, or `Client`. Create a new category group
if none fits. The description becomes the corpo file's `description` field — write it
to let an agent decide whether to read the full doc.

Note the file ID returned. You'll use it to read and edit the file.

---

## Step 2 — Write the initial draft

Read the newly created file, then write the body with the structure below. Draft
confidently from what the user has told you. Gaps and disagreements will surface via
threads in the review loop — don't over-qualify or add placeholder prose.

### Document structure

```markdown
# Overview

[2–3 sentences. What is this feature and why does it exist? Ground it in user or
system need, not implementation. No bullet points here — prose only.]

## Goals

1. [Outcome, not task. What the user or system can do that they couldn't before.]
2. [Keep to 3 max. Forces prioritization. If there are more, the scope is too wide.]
3. [...]

## Non-Goals

- [What we are explicitly not building in this iteration. Just as load-bearing as
  Goals — they prevent scope creep and clarify tradeoffs.]
- [...]

## Other Requirements

- [Hard constraints: performance bounds, zero-config invariants, compatibility rules,
  security properties, platform targets.]
- [Write these as testable assertions where possible.]
- [...]

# User Flows

## [Flow Name]

[Narrative prose. Third person, present tense. "Author runs...", "Visitor navigates..."]
[Walk through a specific journey end-to-end. Be concrete about what triggers the
flow, what the user sees and does, and what the system does in response.]
[One H2 per distinct journey. Cover the main path and important edge cases as
separate flows rather than footnotes.]

## [Flow Name]

[...]

# Technical Design

## [Component or System]

[Design decisions that are non-obvious or have meaningful alternatives. Not an
implementation guide — focus on shape: interface contracts, data formats, state
ownership, key invariants.]
[Use tables for API surfaces. Use numbered lists for multi-step protocols.]
[Omit sections that don't need design decisions — not every feature needs Auth or
Routing sections.]

## [Component or System]

[...]
```

---

## Step 3 — Commit and share for review

After writing the initial draft, commit the file:

```sh
git add .corpo/
git commit -m "feat: add FRD for <feature name>"
```

Tell the user the file is ready and invite them to review it in the GUI or directly
in the file. Threads are the primary review mechanism — the user highlights sections
and adds comments, then you run the `resolve-threads` skill to address them.

---

## Step 4 — Iterate via threads

Run `resolve-threads` on this file whenever the user says they've left feedback.
Repeat until the user considers the doc stable. Aim for:

- No open threads
- Goals that the user explicitly agrees with
- Non-Goals that explicitly capture rejected scope
- User Flows that read as a usable spec, not aspirational prose
- Technical Design sections only where non-obvious decisions need to be pinned

A stable FRD is one where an engineering agent reading it would make the same
implementation choices the author intends.

---

## Step 5 — Hand off to engineering

When ready to implement, reference the FRD explicitly in the engineering prompt:

> "Implement the feature described in `.corpo/files/<fileId>.md`. Treat that doc as
> the spec. If something is ambiguous, update the doc and ask before coding."

The FRD ID is the stable reference. Always use the file ID, not the title, in
agent prompts.

---

## Step 6 — Keep it alive

Update the FRD whenever the feature's behavior changes meaningfully:

- New constraints discovered during implementation → add to Other Requirements
- A Non-Goal becomes a Goal in a later iteration → update Goals, remove from Non-Goals
- A User Flow changes → rewrite that section
- A Technical Design decision is reversed → update or remove that section

Stale FRDs are worse than none — they mislead future agents and authors. After any
significant change to the feature, check whether the FRD still accurately describes
what was built.

---

## Rules

- **Draft first, ask second.** Write a complete doc from what you know. Don't ask
  for every missing detail upfront — threads surface gaps more efficiently.
- **Goals are outcomes, not tasks.** "User can comment without installing the CLI"
  is a goal. "Implement GitHub OAuth Device Flow" is a task.
- **Non-Goals carry equal weight.** An explicit Non-Goal prevents future scope creep
  and documents a real decision. If something was discussed and rejected, write it down.
- **User Flows are prose, not bullets.** Narrative reveals implicit assumptions that
  bullet lists hide. Write flows as you'd describe them to a new engineer on day one.
- **Technical Design is decisions, not code.** Capture the shape and rationale, not
  the implementation. The engineering agent writes the code; the FRD tells it what to
  build and why.
- **One FRD per feature identity.** Don't split a coherent feature across multiple
  docs, and don't force unrelated features into one doc to save space.
