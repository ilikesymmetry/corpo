# Context Manager — Product Discovery

_Discovery session: 2026-03-07_

A git-backed, agent-native document protocol. Docs are written with agents,
stored as markdown in GitHub repos, and readable by humans and agents alike
through persistent links. Designed for bottoms-up adoption across teams of any
size.

---

## Problem Statements

### P1 — No agent-native doc layer

When teammates write docs in Google Docs, no agent can read them efficiently,
navigate them progressively, or write back to them. Every time an agent needs
doc content as input, a human bridges the gap manually. Root cause of P2, P3,
and P4.

### P2 — Persistent documentation decays after every decision

When a decision is made (e.g. a PPS is resolved), the agreed diff doesn't
propagate to persistent docs automatically. A teammate manually updates them
after each decision. Docs lag, one person is burdened, and the team's
persistent context becomes stale over time.

### P3 — Doc-to-execution handoff is lossy

When a doc reaches consensus and implementation begins, the agent can't access
the agreed decision and its rationale directly. The author re-articulates from
memory in a prompt. Implementation drifts from intent; context is lost; effort
is duplicated.

### P4 — Agents can't navigate project hub docs

When an agent needs project context to carry out a task, the hub doc is too
large to consume whole and section-specific links don't resolve reliably.
Agents fail to find what matters; humans bridge the gap manually every time.

### P5 — Creating docs that depend on existing context requires manual assembly

When writing any new doc that builds on prior decisions, linked docs, or
project history, there is no way for an agent to discover and pull relevant
context autonomously. The author assembles it manually, which both slows
drafting and limits how much the agent can contribute.

---

## Related Docs

- [User Flows](user-flows.md)
- [Protocol Specification](protocol.md)
- [Migration & Import](migration.md)
- [Open Questions](open-questions.md)
