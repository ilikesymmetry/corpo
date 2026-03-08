# Context Manager — Open Questions

_See also: [Discovery](discovery.md)_

---

## Open Questions

| Topic | Status | Notes |
|---|---|---|
| Global ID format | TBD | Short opaque string; need collision strategy across repos |
| Thread anchor precision | TBD | Proximity rule vs. explicit anchor syntax |
| Doc creation scaffolding | TBD | Guided interview flow per doc type; additive, not blocking |
| Cross-repo ID resolution | TBD | Short ID ambiguity when multiple repos configured |
| CLI distribution | TBD | Open protocol; want public usability, not just internal |
| Auth implementation (Okta) | Deferred | GitHub OAuth ships first; Okta follows |
| Viewer / editor implementation | Deferred | Custom web app; must render threads natively |

---

## Out of Scope

- **Linear / GitHub replacement** — this system aggregates and links to them,
  it does not replace them
- **Real-time collaboration** — the loop is async: write, comment, delegate,
  revise
- **Custom permission system** — repo permissions are the primitive; no
  parallel ACL layer
- **Google Docs as an ongoing integration target** — Google Docs is a migration
  source only; not a live sync target
